'use strict';

const {Contract} = require('fabric-contract-api');

class PharmanetContract extends Contract {

	constructor() {
		// Provide a custom name to refer to this smart contract
        super('org.pharma-network.pharmanet');
	}

	async instantiate(ctx) {
		console.log('Pharmanet Smart Contract Instantiated');
    }
    
    async registerCompany (ctx, companyCRN, companyName, location, organisationRole){
        const companyKey = ctx.stub.createCompositeKey('org.pharma-network.com.pharmanet.company', [companyCRN,companyName]);
        const hierarchyId = this.getCompanyHierarchyId(organisationRole);
        let newCompanyObject = {
            companyId : companyKey,
            name : companyName,
            location : location,
            organisationRole : organisationRole,
            hierarchyKey : hierarchyId,
            createdAt : new Date()
        };
        let dataBuffer = Buffer.from(JSON.stringify(newCompanyObject));
        await ctx.stub.putState(companyKey,dataBuffer);
        return newCompanyObject;
    }

    async addDrug (ctx, drugName, serialNo, mfgDate, expDate, companyCRN){
        let manufacturerOrg = "manufacturer.pharma-network.com";
        this.validateInitiator(ctx,manufacturerOrg);

        const productKey = ctx.stub.createCompositeKey('org.pharma-network.com.pharmanet.product',[drugName,serialNo]);

        let iterator = await ctx.stub.getStateByPartialCompositeKey('org.pharma-network.com.pharmanet.company', [companyCRN]);
        let manufacturerResults = await this.getAllResults(iterator);
        let newProductObject = {
            productId : productKey,
            name : drugName,
            manufacturer : manufacturerResults[0].companyId,
            manufacturingDate : mfgDate,
            expiryDate : expDate,
            owner : manufacturerResults[0].companyId,
            shipment : [],
            createdAt : new Date()
        };
        let dataBuffer = Buffer.from(JSON.stringify(newProductObject));
        await ctx.stub.putState(productKey,dataBuffer);
        return newProductObject;
    }


    async createPO(ctx, buyerCRN, sellerCRN, drugName, quantity){
        const initiatorID = ctx.clientIdentity.getX509Certificate();
        if(initiatorID.issuer.organizationName.trim() == "distributor.pharma-network.com" || initiatorID.issuer.organizationName.trim() == "retailer.pharma-network.com"  ){
            let buyerIterator =  await ctx.stub.getStateByPartialCompositeKey('org.pharma-network.com.pharmanet.company', [buyerCRN]);
            let buyerResults = await this.getAllResults(buyerIterator);
            let sellerIterator =  await ctx.stub.getStateByPartialCompositeKey('org.pharma-network.com.pharmanet.company', [sellerCRN]);
            let sellerResults = await this.getAllResults(sellerIterator);
            const poKey =  ctx.stub.createCompositeKey('org.pharma-network.com.pharmanet.purchaseOrder',[buyerCRN,drugName]);
            this.validatePO(ctx, buyerResults[0],sellerResults[0], poKey);

            let drugIterator =  await ctx.stub.getStateByPartialCompositeKey('org.pharma-network.com.pharmanet.product', [drugName]);
            let drugResults = await this.getAllResults(drugIterator);

            this.validateSeller(drugResults[0],sellerResults[0]);

            let newPurchaseOrderObj = {
                poId : poKey,
                drugName : drugName,
                quantity : quantity,
                buyer : buyerResults[0].companyId,
                seller : sellerResults[0].companyId,
                createdAt : new Date()
            };
            let dataBuffer = Buffer.from(JSON.stringify(newPurchaseOrderObj));
            await ctx.stub.putState(poKey,dataBuffer);
            return newPurchaseOrderObj;
        }
        else{
            throw new Error('Not authorized to initiate the transaction: ' + initiatorID.issuer.organizationName + ' not authorised to initiate this transaction');
        }
    }


    async createShipment(ctx, buyerCRN, drugName, listOfAssets, transporterCRN){
        
        listOfAssets = listOfAssets.split(',');
        
        const poKey = ctx.stub.createCompositeKey('org.pharma-network.com.pharmanet.purchaseOrder',[buyerCRN,drugName]);
        let poBuffer= await ctx.stub.getState(poKey).catch(err => console.log(err));

        
        let poObject= JSON.parse(poBuffer.toString());
        if(poObject.poId == undefined || poObject.poId == null){
            throw new Error('No purhase order exists with given buyer and product name.')
        }
        
        let transporterIterator =  await ctx.stub.getStateByPartialCompositeKey('org.pharma-network.com.pharmanet.company', [transporterCRN]);
        let transporterResults = await this.getAllResults(transporterIterator);

        let buyerIterator =  await ctx.stub.getStateByPartialCompositeKey('org.pharma-network.com.pharmanet.company', [buyerCRN]);
        let buyerResults = await this.getAllResults(buyerIterator);
        
        if(parseInt(poObject.quantity) != listOfAssets.length)
            throw new Error('Invalid shipment details. Purchase order quantity do not match shipment details.');

        await this.validateAssets(ctx, listOfAssets);
        
        let shipmentKey = ctx.stub.createCompositeKey('org.pharma-network.com.pharmanet.shipment',[buyerCRN,drugName]);
        let newShipmentObj = {
            shipmentId : shipmentKey,
            creator : poObject.seller,
            assets : listOfAssets,
            transporter : transporterResults[0].companyId,
            status : "in-transit",
            createdAt : new Date()
        };
        let dataBuffer = Buffer.from(JSON.stringify(newShipmentObj));
        await ctx.stub.putState(shipmentKey,dataBuffer);
        
        await this.updateAssetOwners(ctx, listOfAssets, buyerResults[0].companyId, newShipmentObj);
        
        
        return newShipmentObj;
	}
	
	async updateShipment(ctx, buyerCRN, drugName, transporterCRN){
		let shipmentKey = ctx.stub.createCompositeKey('org.pharma-network.com.pharmanet.shipment',[buyerCRN,drugName]);
		let shipmentBuffer= await ctx.stub.getState(shipmentKey).catch(err => console.log(err));
		let shipmentObject= JSON.parse(shipmentBuffer.toString());

		let transporterIterator =  await ctx.stub.getStateByPartialCompositeKey('org.pharma-network.com.pharmanet.company', [transporterCRN]);
		let transporterResults = await this.getAllResults(transporterIterator);

		let buyerIterator =  await ctx.stub.getStateByPartialCompositeKey('org.pharma-network.com.pharmanet.company', [buyerCRN]);
        let buyerResults = await this.getAllResults(buyerIterator);

		if(shipmentObject.transporter == transporterResults[0].companyId){

			let newShipmentObj = {
				shipmentId : shipmentKey,
				creator : shipmentObject.creator,
				assets : shipmentObject.assets,
				transporter : transporterResults[0].companyId,
				status : "delivered",
				createdAt : new Date()
			};
			let dataBuffer = Buffer.from(JSON.stringify(newShipmentObj));
			await ctx.stub.putState(shipmentKey,dataBuffer);
			await this.updateAssetOwners(ctx, shipmentObject.assets, buyerResults[0].companyId, newShipmentObj);
			return newShipmentObj;
		}
		else{
			throw new Error('Not authorized to initiate the transaction: Transporter not authorised to initiate this transaction');
		}
	}


	async retailDrug(ctx, drugName, serialNo, retailerCRN, customerAadhar){
		let retailerOrg = "retailer.pharma-network.com";
		this.validateInitiator(ctx,retailerOrg);
		
		const productKey = ctx.stub.createCompositeKey('org.pharma-network.com.pharmanet.product',[drugName,serialNo]);

		let productBuffer= await ctx.stub.getState(productKey).catch(err => console.log(err));
		let productObject= JSON.parse(productBuffer.toString());

		productObject.owner = customerAadhar;
		let dataBuffer = Buffer.from(JSON.stringify(productObject));
		await ctx.stub.putState(productKey,dataBuffer);
		return productObject;
	}

	async viewHistory(ctx, drugName, serialNo){
		const productKey = ctx.stub.createCompositeKey('org.pharma-network.com.pharmanet.product',[drugName,serialNo]);

		const historyIterator = await ctx.stub.getHistoryForKey(productKey).catch(err => console.log(err));
        let result = [];
        let res = await historyIterator.next();
        while (!res.done) {
          if (res.value) {
            console.info(`found state update with value: ${res.value.value.toString('utf8')}`);
            const obj = JSON.parse(res.value.value.toString('utf8'));
            result.push(obj);
          }
          res = await historyIterator.next();
        }
        await historyIterator.close();
        return result;  
	}

	async viewDrugCurrentState(ctx, drugName, serialNo) {
		const productKey = ctx.stub.createCompositeKey('org.pharma-network.com.pharmanet.product',[drugName,serialNo]);

		let productBuffer= await ctx.stub.getState(productKey).catch(err => console.log(err));
		let productObject= JSON.parse(productBuffer.toString());
		return productObject;
    }
    
    validateInitiator(ctx, initiator)
	{
		const initiatorID = ctx.clientIdentity.getX509Certificate();
		console.log(initiator); 
		if(initiatorID.issuer.organizationName.trim() !== initiator)
		{
				throw new Error('Not authorized to initiate the transaction: ' + initiatorID.issuer.organizationName + ' not authorised to initiate this transaction');
		}
	}
    
    getCompanyHierarchyId(organisationRole){
        let organisationRoles = ["Manufacturer","Distributor","Retailer"];
        if(organisationRoles.indexOf(organisationRole) != -1)
            return organisationRoles.indexOf(organisationRole) + 1;
        else
            return -1;
    }

    validatePO(ctx,buyerObj,sellerObj,poId){
        if(buyerObj.hierarchyKey - sellerObj.hierarchyKey !== 1){
            throw new Error('Not authorized to initiate the transaction: as transfer of drug takes place in a hierarchical manner');
        }

    }

    validateSeller(drugObj,sellerObj){
        if(drugObj.owner != sellerObj.companyId){
            throw new Error('Invalid transaction : Seller is not the owner of the drug provided.');
        }
    }

    async validateAssets(ctx, listOfAssets){
        for(let i=0;i<listOfAssets.length;i++){
            let drugName = listOfAssets[0].split('|')[0].toString();
            let serialNo = listOfAssets[0].split('|')[1].toString();
            let drugCompositeKey = ctx.stub.createCompositeKey('org.pharma-network.com.pharmanet.product',[drugName,serialNo]);
            let drugBuffer = await ctx.stub.getState(drugCompositeKey).catch(err => console.log(err));
            let drugObj= JSON.parse(drugBuffer.toString());
            if(drugObj.productId == undefined || drugObj.productId == null){
                throw new Error('Invalid transaction : Incorrect asset list provided. Please check the assets info provided.');
            }
        }
    }

    async updateAssetOwners(ctx, listOfAssets, buyerId, shipmentObject){
        for(let i=0;i<listOfAssets.length;i++){
            let drugName = listOfAssets[0].split('|')[0].toString();
            let serialNo = listOfAssets[0].split('|')[1].toString();
            let drugCompositeKey = ctx.stub.createCompositeKey('org.pharma-network.com.pharmanet.product',[drugName,serialNo]);
            let drugBuffer = await ctx.stub.getState(drugCompositeKey).catch(err => console.log(err));
            let drugObj= JSON.parse(drugBuffer.toString());
            drugObj.owner =  shipmentObject.status == "in-transit" ? shipmentObject.transporter : buyerId;
            drugObj.shipment.push(shipmentObject.shipmentId);
            let dataBuffer = Buffer.from(JSON.stringify(drugObj));
            await ctx.stub.putState(drugCompositeKey, dataBuffer);
        }
    }

    async getAllResults(iterator) {
        const allResults = [];
        while (true) {
            const res = await iterator.next();
            if (res.value) {
                // if not a getHistoryForKey iterator then key is contained in res.value.key
                allResults.push(JSON.parse(res.value.value.toString('utf8')));
            }
            if (res.done) {         
                await iterator.close();
                return allResults;
            }
        }
	}
		
}

module.exports = PharmanetContract;

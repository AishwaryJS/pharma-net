'use strict';

const helper = require('./contractHelper');

async function main(buyerCRN, sellerCRN, drugName, quantity, organizationRole) {

	try {
		const pharmanetContract = await helper.getContractInstance(organizationRole);

		console.log('.....Requesting to create a New User on the Network');
		const newPoBuffer = await pharmanetContract.submitTransaction('createPO', buyerCRN, sellerCRN, drugName, quantity);

		// process response
		console.log('.....Processing Add PO Transaction Response \n\n');
		let newPo = JSON.parse(newPoBuffer.toString());
		console.log(newPo);
		console.log('\n\n.....Add PO Transaction Complete!');
		return newPo;

	} catch (error) {
		console.log(`\n\n ${error} \n\n`);
		throw new Error(error);

	} finally {
		// Disconnect from the fabric gateway
		helper.disconnect();
	}
}

module.exports.execute = main;

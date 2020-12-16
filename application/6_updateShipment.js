'use strict';

const helper = require('./contractHelper');

async function main(buyerCRN, drugName, transporterCRN, organizationRole) {

	try {
		const pharmanetContract = await helper.getContractInstance(organizationRole);

		console.log('.....Requesting to update shipment on the Network');
		const newShipmentBuffer = await pharmanetContract.submitTransaction('updateShipment', buyerCRN, drugName, transporterCRN);

		// process response
		console.log('.....Processing update shipment Response \n\n');
		let newShipment = JSON.parse(newShipmentBuffer.toString());
		console.log(newShipment);
		console.log('\n\n.....Update Shipment Transaction Complete!');
		return newShipment;

	} catch (error) {
		console.log(`\n\n ${error} \n\n`);
		throw new Error(error);

	} finally {
		// Disconnect from the fabric gateway
		helper.disconnect();
	}
}

module.exports.execute = main;

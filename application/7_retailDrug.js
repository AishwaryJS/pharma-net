'use strict';

const helper = require('./contractHelper');

async function main(drugName, serialNo, retailerCRN, customerAadhar, organizationRole) {

	try {
		const pharmanetContract = await helper.getContractInstance(organizationRole);

		console.log('.....Requesting to retail drug on the Network');
		const newRetailBuffer = await pharmanetContract.submitTransaction('retailDrug', drugName, serialNo, retailerCRN, customerAadhar);

		// process response
		console.log('.....Processing retail drug Response \n\n');
		let newRetail = JSON.parse(newRetailBuffer.toString());
		console.log(newRetail);
		console.log('\n\n.....Retail Drug Transaction Complete!');
		return newRetail;

	} catch (error) {
		console.log(`\n\n ${error} \n\n`);
		throw new Error(error);

	} finally {
		// Disconnect from the fabric gateway
		helper.disconnect();
	}
}

module.exports.execute = main;

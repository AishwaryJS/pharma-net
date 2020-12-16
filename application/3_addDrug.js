'use strict';

const helper = require('./contractHelper');

async function main(drugName, serialNo, mfgDate, expDate, companyCRN, organizationRole) {

	try {
		const pharmanetContract = await helper.getContractInstance(organizationRole);

		console.log('.....Requesting to create a New User on the Network');
		const newDrugBuffer = await pharmanetContract.submitTransaction('addDrug', drugName, serialNo, mfgDate, expDate, companyCRN);

		// process response
		console.log('.....Processing Add Drug Transaction Response \n\n');
		let newDrug = JSON.parse(newDrugBuffer.toString());
		console.log(newDrug);
		console.log('\n\n.....Add Drug Transaction Complete!');
		return newDrug;

	} catch (error) {
		console.log(`\n\n ${error} \n\n`);
		throw new Error(error);

	} finally {
		// Disconnect from the fabric gateway
		helper.disconnect();
	}
}

module.exports.execute = main;

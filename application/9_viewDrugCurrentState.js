'use strict';

const helper = require('./contractHelper');

async function main(drugName, serialNo, organizationRole) {

	try {
		const pharmanetContract = await helper.getContractInstance(organizationRole);

		console.log('.....Requesting to view drug on the Network');
		const newDrugBuffer = await pharmanetContract.submitTransaction('viewDrugCurrentState', drugName, serialNo);

		// process response
		console.log('.....Processing View Drug Response \n\n');
		let newDrug = JSON.parse(newDrugBuffer.toString());
		console.log(newDrug);
		console.log('\n\n.....View Transaction Complete!');
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

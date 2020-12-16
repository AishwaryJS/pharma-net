'use strict';

const helper = require('./contractHelper');

async function main(drugName, serialNo, organizationRole) {

	try {
		const pharmanetContract = await helper.getContractInstance(organizationRole);

		console.log('.....Requesting to view drug history on the Network');
		const newDrugHistoryBuffer = await pharmanetContract.submitTransaction('viewHistory', drugName, serialNo);

		// process response
		console.log('.....Processing View Drug History Response \n\n');
		let newDrugHistory = JSON.parse(newDrugHistoryBuffer.toString());
		console.log(newDrugHistory);
		console.log('\n\n.....View History Transaction Complete!');
		return newDrugHistory;

	} catch (error) {
		console.log(`\n\n ${error} \n\n`);
		throw new Error(error);

	} finally {
		// Disconnect from the fabric gateway
		helper.disconnect();
	}
}

module.exports.execute = main;

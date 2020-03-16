@IsTest
public class RelatedContractsControllerTest {

@IsTest
static void testGetRelatedContracts_onSameAccount() {
	Account acc = new Account();
	acc.Name = 'testAccount';
	insert acc;

	Contract cont = new Contract();
	cont.AccountId = acc.Id;
	cont.Status = 'Draft';
	insert cont;

	List<Contract> contractList = RelatedContractsController.getRelatedContracts(acc.Id, 'Account');
	Contract actualContract = contractList[0];
	Id expectedContractId = cont.Id;

	System.assertEquals(expectedContractId, actualContract.Id);
}

@IsTest
static void testGetRelatedContracts_onParentAccount() {
	Account parentAccount = new Account();
	parentAccount.Name = 'parentTestAccount';
	insert parentAccount;

	Account acc = new Account();
	acc.Name = 'testAccount';
	acc.ParentId = parentAccount.Id;
	insert acc;

	Contract cont = new Contract();
	cont.AccountId = parentAccount.Id;
	cont.Status = 'Draft';
	insert cont;

	List<Contract> contractList = RelatedContractsController.getRelatedContracts(acc.Id, 'Account');
	Contract actualContract = contractList[0];
	Id expectedContractId = cont.Id;

	System.assertEquals(expectedContractId, actualContract.Id);
}

@IsTest
static void testGetRelatedContracts_onParentAndSameAccount() {
	Account parentAccount = new Account();
	parentAccount.Name = 'parentTestAccount';
	insert parentAccount;

	Account acc = new Account();
	acc.Name = 'testAccount';
	acc.ParentId = parentAccount.Id;
	insert acc;

	Account otherAcc = new Account();
	otherAcc.Name = 'otherTestAcc';
	insert otherAcc;

	Contract cont = new Contract();
	cont.AccountId = acc.Id;
	cont.Status = 'Draft';

	Contract cont2 = new Contract();
	cont2.AccountId = parentAccount.Id;
	cont2.Status = 'Draft';

	Contract cont3 = new Contract();
	cont3.AccountId = otherAcc.Id;
	cont3.Status = 'Draft';
	insert new List<Contract> {cont, cont2, cont3};

	List<Contract> contractList = RelatedContractsController.getRelatedContracts(acc.Id, 'Account');
	System.assertEquals(contractList.size(), 2);

	List<String> contractIds = new List<String>();
	contractIds.add(cont.Id);
	contractIds.add(cont2.Id);

	for (Contract contr : contractList) {
		System.assert (contr.Id == cont.Id || contr.Id ==cont2.Id);
	}

}
}

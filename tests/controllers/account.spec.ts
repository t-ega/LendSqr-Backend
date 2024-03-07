import AccountsController from "../../controllers/account.controller";
import AccountRepository from "../../repositories/account.repository";

describe('AccountsController', () => {
    let accountsController: AccountsController;
    let accountsRepository: AccountRepository;
    
    beforeEach(() => {
        accountsRepository = new AccountRepository();
        accountsController = new AccountsController(accountsRepository);
    });

    it("acccounts repository should be defined", () => {
        expect(accountsRepository).toBeDefined()
    });

    it("accounts controller should be defined", () => {
        expect(accountsController).toBeDefined()
    });

    
})
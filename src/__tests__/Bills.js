/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import Bills from "../containers/Bills.js";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js";
import router from "../app/Router.js";

// Important : Pour remplacer les fonctions de /app/store par __mocks__/store pour simuler les requetes API 
jest.mock('../app/store', () => mockStore)

describe("Given I am connected as an employee", () => {
	describe("When I am on Bills Page", () => {
		test("Then bill icon in vertical layout should be highlighted", async () => {
			Object.defineProperty(window, "localStorage", { value: localStorageMock });
			window.localStorage.setItem("user",	JSON.stringify({type: "Employee"}));
      document.body.innerHTML = '<div id="root"></div>'
			router();

      window.onNavigate(ROUTES_PATH.Bills);
			await waitFor(() => screen.getByTestId("icon-window"));
			const windowIcon = screen.getByTestId("icon-window");
			expect(windowIcon.className).toBe("active-icon");
		});
		test("Then bills should be ordered from earliest to latest", () => {
			document.body.innerHTML = BillsUI({ data: bills.sort((a, b) => new Date(b.date) - new Date(a.date)) });
			const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map((a) => a.innerHTML);
			const antiChrono = (a, b) => (a < b ? 1 : -1);
			const datesSorted = [...dates].sort(antiChrono);
			expect(dates).toEqual(datesSorted);
		});
	});

	describe("When I am on Bills page but it is loading", () => {
		test("Then, Bills page should be rendered", () => {
			document.body.innerHTML = BillsUI({ loading: true });
			expect(screen.getAllByText("Loading...")).toBeTruthy();
		});
	});

	describe("When I am on Bills page but back-end send an error message", () => {
		test("Then, Error page should be rendered", () => {
			document.body.innerHTML = BillsUI({ error: "some error message" });
			expect(screen.getAllByText("Erreur")).toBeTruthy();
		});
	});

	describe("When I am on Bills page and I click for new bill", () => {
		test("Then, new bill form should appear", () => {
			const onNavigate = (pathname) => {
				document.body.innerHTML = ROUTES({ pathname });
			};

			Object.defineProperty(window, "localStorage", { value: localStorageMock });
			window.localStorage.setItem("user", JSON.stringify({type: "Employee"}));

			const bills = new Bills({
				document,
				onNavigate,
				store: null,
				localStorage: window.localStorage,
			});
			const handleNewBill = jest.fn((e) => bills.handleClickNewBill(e));

			document.body.innerHTML = BillsUI({ data: null, loading: false, error: false });
			const panelNewBill = screen.getByTestId("btn-new-bill");
			panelNewBill.addEventListener("click", handleNewBill);
			userEvent.click(panelNewBill);
			expect(handleNewBill).toHaveBeenCalled();
			expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy();
		});
	});

	describe("When I am on Bills page and I click on eye icon of a bill", () => {
		test("Then, right view should appear", () => {

			// Simuler le fonctionnement de la fonction Jquery() / $() dans Node.
			// car jQuery est utilisée dans handleClickIconEye
			$.fn.modal = jest.fn();

			const onNavigate = (pathname) => {
				document.body.innerHTML = ROUTES({ pathname });
			};

			Object.defineProperty(window, "localStorage", { value: localStorageMock });
			window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));

			document.body.innerHTML = BillsUI({ data: bills });

			const userbills = new Bills({
				document,
				onNavigate,
				store: mockStore,
				localStorage: window.localStorage,
			});
			const icon = screen.getAllByTestId("icon-eye")[0];
			const handleIconEye = jest.fn((e) => {
				userbills.handleClickIconEye(e.target);
			});

			icon.addEventListener("click", handleIconEye);
			userEvent.click(icon);
			expect(handleIconEye).toHaveBeenCalled();
			expect(screen.getAllByText(`Justificatif`)).toBeTruthy();
		});
	});
});

describe("Given I am a user connected as Employee", () => {
	describe("When I navigate to Bills", () => {
		test("fetches header titles for bills from mock API GET", async () => {
			// Vérifie les intitulés de la table des bills
			window.onNavigate(ROUTES_PATH.Bills)
			await waitFor(() => screen.getByText("Mes notes de frais"))
			expect(screen.getAllByText("Type")).toBeTruthy()
			expect(screen.getAllByText("Nom")).toBeTruthy()
			expect(screen.getAllByText("Date")).toBeTruthy()
			expect(screen.getAllByText("Montant")).toBeTruthy()
			expect(screen.getAllByText("Statut")).toBeTruthy()
			expect(screen.getAllByText("Actions")).toBeTruthy()
      expect(screen.getByTestId("tbody")).toBeTruthy()
      expect(screen.getAllByText("encore"))
		});

		test("successfull fetch bills from mock API GET", async () => {
			// Vérifie le nombre de bills
			const userbills = await mockStore.bills().list();
			expect(userbills.length).toBe(4);
		});
	});

  describe("When I get corrupted data on bills page", () => {
		test("Then it sould display with unformatted date", async () => {
      
      jest.spyOn(mockStore, "bills")
			Object.defineProperty(window, "localStorage", { value: localStorageMock })
      Object.defineProperty(window, "location", { value: { hash: ROUTES_PATH['Bills']}})
			window.localStorage.setItem("user", JSON.stringify({ type: "Employee"}))
      document.body.innerHTML = '<div id="root"></div>'
			router()

      const userBills = await mockStore.bills().list()
      const userBillsCorrupted = [{...userBills[0]}]
      userBillsCorrupted[0].date = '2560-48/54'

      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () => {
            return Promise.resolve(userBillsCorrupted)
          }
        }
      })

			window.onNavigate(ROUTES_PATH.Bills);
			const dateCorrupted = await waitFor(() => screen.getAllByText('2560-48/54'))
			expect(dateCorrupted).toBeTruthy();
		});

  })

	describe("When an error occurs on API", () => {
		beforeEach(() => {
			jest.spyOn(mockStore, "bills");
			Object.defineProperty(window, "localStorage", { value: localStorageMock });
			window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
      document.body.innerHTML = '<div id="root"></div>'
			router();
		});

		test("fetches bills from an API and fails with 404 message error", async () => {
			mockStore.bills.mockImplementationOnce(() => {
				return {
					list: () => {
						return Promise.reject(new Error("Erreur 404"));
					},
				};
			});
			window.onNavigate(ROUTES_PATH.Bills);
			await new Promise(process.nextTick);
			const message = await waitFor(() => screen.getAllByText(/Erreur 404/))
			expect(message).toBeTruthy();
		});

		test("fetches bills from an API and fails with 500 message error", async () => {
			mockStore.bills.mockImplementationOnce(() => {
				return {
					list: () => {
						return Promise.reject(new Error("Erreur 500"));
					},
				};
			});
			window.onNavigate(ROUTES_PATH.Bills);
			await new Promise(process.nextTick);
			const message = await waitFor(() => screen.getAllByText(/Erreur 500/))
			expect(message).toBeTruthy();
		});


  });
});

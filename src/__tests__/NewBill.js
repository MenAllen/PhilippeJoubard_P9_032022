/**
 * @jest-environment jsdom
 */
import { screen, fireEvent } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import mockStore from "../__mocks__/store"
import { localStorageMock } from "../__mocks__/localStorage"
import router from "../app/Router.js";
import { ROUTES_PATH } from "../constants/routes"

// Important : Pour remplacer les fonctions de /app/store par __mocks__/store pour simuler les requetes API 
jest.mock('../app/store', () => mockStore)

describe('Given I am connected as an employee', () => {
  describe('When I am on NewBill Page', () => {

    beforeEach(() => {
			Object.defineProperty(window, 'localStorage', { value: localStorageMock });
			Object.defineProperty(window, 'location', { value: { hash: ROUTES_PATH['NewBill'] } });
			window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }));
      document.body.innerHTML = '<div id="root"></div>'
			router();
		});

    test('Then title is displayed', () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      const title = screen.getAllByText('Envoyer une note de frais')
      expect(title).toBeTruthy
    })

    test('Then mail icon is highlighted', () => {
      const mailIcon = screen.getByTestId('icon-mail')
      expect(mailIcon.className).toBe('active-icon')
    })

    test('Then form inputs are present', () => {
      
      expect(screen.getByTestId('expense-type')).toBeTruthy // expense-type
      expect(screen.getAllByText('Transports')).toBeTruthy
      expect(screen.getAllByText('Restaurants et bars')).toBeTruthy
      expect(screen.getAllByText('Hôtel et logement')).toBeTruthy
      expect(screen.getAllByText('Services en ligne')).toBeTruthy
      expect(screen.getAllByText('IT et électronique')).toBeTruthy
      expect(screen.getAllByText('Equipement et matériel')).toBeTruthy
      expect(screen.getAllByText('Fournitures de bureau')).toBeTruthy
     
      expect(screen.getByTestId('expense-name')).toBeTruthy // expense-name     
      expect(screen.getByTestId('datepicker')).toBeTruthy // datepicker
      expect(screen.getByTestId('amount')).toBeTruthy // amount
      expect(screen.getByTestId('vat')).toBeTruthy // vat
      expect(screen.getByTestId('pct')).toBeTruthy // pct
      expect(screen.getByTestId('commentary')).toBeTruthy // commentary
    })
  })

  describe('When I am on NewBill Page', () => {

    beforeEach(() => {
			Object.defineProperty(window, 'localStorage', { value: localStorageMock });
			Object.defineProperty(window, 'location', { value: { hash: ROUTES_PATH['NewBill'] } });
			window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }));
      document.body.innerHTML = '<div id="root"></div>'
			router();
		});

    test('Then mail icon is highlighted', () => {
      const newBill = new NewBill({document, onNavigate, store: mockStore, localStorage: window.localStorage})
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))
      const formNewBill = screen.getByTestId(`form-new-bill`)
      formNewBill.addEventListener('submit', handleSubmit)
			fireEvent.submit(formNewBill);
			expect(handleSubmit).toHaveBeenCalled();
//      const file = this.document.querySelector(`input[data-testid="file"]`)
//      file.addEventListener("change", this.handleChangeFile)  
    })
  })
})

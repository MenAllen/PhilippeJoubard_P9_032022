/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom"
import { screen, fireEvent, waitFor } from "@testing-library/dom"
import userEvent from "@testing-library/user-event"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import mockStore from "../__mocks__/store"
import { localStorageMock } from "../__mocks__/localStorage"
import router from "../app/Router.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes"

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
      document.body.innerHTML = NewBillUI()
      const title = screen.getAllByText('Envoyer une note de frais')
      expect(title).toBeTruthy()
    })

    test('Then mail icon is highlighted', () => {
      const mailIcon = screen.getByTestId('icon-mail')
      expect(mailIcon.className).toBe('active-icon')
    })

    test('Then form inputs are present', () => {
      
      expect(screen.getByTestId('expense-type')).toBeTruthy() // expense-type
      expect(screen.getAllByText('Transports')).toBeTruthy()
      expect(screen.getAllByText('Restaurants et bars')).toBeTruthy()
      expect(screen.getAllByText('Hôtel et logement')).toBeTruthy()
      expect(screen.getAllByText('Services en ligne')).toBeTruthy()
      expect(screen.getAllByText('IT et électronique')).toBeTruthy()
      expect(screen.getAllByText('Equipement et matériel')).toBeTruthy()
      expect(screen.getAllByText('Fournitures de bureau')).toBeTruthy()
     
      expect(screen.getByTestId('expense-name')).toBeTruthy() // expense-name     
      expect(screen.getByTestId('datepicker')).toBeTruthy() // datepicker
      expect(screen.getByTestId('amount')).toBeTruthy() // amount
      expect(screen.getByTestId('vat')).toBeTruthy() // vat
      expect(screen.getByTestId('pct')).toBeTruthy() // pct
      expect(screen.getByTestId('commentary')).toBeTruthy() // commentary
    })
  })

  describe('When I submit NewBill with incorrect or missing input ', () => {

    beforeEach(() => {
			Object.defineProperty(window, 'localStorage', { value: localStorageMock });
			Object.defineProperty(window, 'location', { value: { hash: ROUTES_PATH['NewBill'] } });
			window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }));
      document.body.innerHTML = '<div id="root"></div>'
      router();
		});

    test('Then an input validation error occurs', () => {

      const newBill = new NewBill({document, onNavigate, store: mockStore, localStorage: window.localStorage})
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))
      const formNewBill = screen.getByTestId(`form-new-bill`)
      const data = {type: ''}
      const inputType = screen.getByTestId('expense-type')

      // Set invalid input type for expense-type
      fireEvent.change(inputType, { target: {value: data.type}})

      formNewBill.addEventListener('submit', handleSubmit)
			fireEvent.submit(formNewBill);
			expect(handleSubmit).toHaveBeenCalled();
      expect(inputType.validity.valid).not.toBeTruthy()

    })

    test('Then a file with incorrect extension cannot be uploaded', () => {

      const newBill = new NewBill({document, onNavigate, store: mockStore, localStorage: window.localStorage})
      const handleChange = jest.fn((e) => newBill.handleChangeFile(e))
      const btnChange = screen.getByTestId(`file`)
      const msgWarning = screen.getByTestId('warning')

      // Set correct file extension 
      const justiFile = new File(['img'], 'justif.webp', {type: 'img/webp'})
            
      btnChange.addEventListener('change', handleChange)
      fireEvent.change(btnChange, {target: {files: [justiFile]}})

      expect(msgWarning.classList).not.toContain("hidden")
     
    })

    test('Then a file with correct extension can be uploaded', () => {

      const newBill = new NewBill({document, onNavigate, store: mockStore, localStorage: window.localStorage})
      const handleChange = jest.fn((e) => newBill.handleChangeFile(e))
      const btnChange = screen.getByTestId(`file`)
      const msgWarning = screen.getByTestId('warning')

      // Set correct file extension 
      const justiFile = new File(['img'], 'justif.png', {type: 'img/png'})
            
      btnChange.addEventListener('change', handleChange)
      fireEvent.change(btnChange, {target: {files: [justiFile]}})

      expect(msgWarning.classList).toContain("hidden")
     
    })

  })

  describe('When I submit NewBill with correct inputs ', () => {

    test('Then a post is sent to add a new bill to the employee', async () => {

			Object.defineProperty(window, 'localStorage', { value: localStorageMock });
			Object.defineProperty(window, 'location', { value: { hash: ROUTES_PATH['NewBill'] } });
			window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }));
      document.body.innerHTML = '<div id="root"></div>'
      router();

      document.body.innerHTML = NewBillUI({})
      const newBill = new NewBill({document, onNavigate, store: mockStore, localStorage: window.localStorage})
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))
      const formNewBill = screen.getByTestId(`form-new-bill`)

      // Données d'entrée de la facture
      const data = {
        type: 'Restaurants et bars',
        name: 'Auberge des trois blaireaux',
        amount: '4321',
        date: '2022-06-23',
        vat: 70,
        pct: 20,
        file: new File(['img'], 'justif.png', {type: 'img/png'}),
        commentary: 'Déjeuner de travail',
        status: 'pending'
      }

      // Mise à jour des inputs
      fireEvent.change(screen.getByTestId('expense-type'), { target: { value: data.type}})
      fireEvent.change(screen.getByTestId('expense-name'), { target: { value: data.name}})
      fireEvent.change(screen.getByTestId('amount'), { target: { value: data.amount}})
      fireEvent.change(screen.getByTestId('datepicker'), { target: { value: data.date}})
      fireEvent.change(screen.getByTestId('vat'), { target: { value: data.vat}})
      fireEvent.change(screen.getByTestId('pct'), { target: { value: data.pct}})
      fireEvent.change(screen.getByTestId('commentary'), { target: { value: data.commentary}})

      // Submit formulaire
      formNewBill.addEventListener('submit', handleSubmit)
      await waitFor(() => userEvent.upload(screen.getByTestId('file'), data.file))
      fireEvent.submit(formNewBill)

			expect(handleSubmit).toHaveBeenCalled()
      expect(screen.getByTestId('expense-type').validity.valid).toBeTruthy()
      expect(screen.getByTestId('expense-name').validity.valid).toBeTruthy()
      expect(screen.getByTestId('amount').validity.valid).toBeTruthy()
      expect(screen.getByTestId('datepicker').validity.valid).toBeTruthy()
      expect(screen.getByTestId('vat').validity.valid).toBeTruthy()
      expect(screen.getByTestId('pct').validity.valid).toBeTruthy()
      expect(screen.getByTestId('commentary').validity.valid).toBeTruthy()
      expect(screen.getByTestId('warning').classList).toContain("hidden")

    })

  })
})

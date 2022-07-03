import { ROUTES_PATH } from "../constants/routes.js";
import Logout from "./Logout.js";

export default class NewBill {
	constructor({ document, onNavigate, store, localStorage }) {
		this.document = document;
		this.onNavigate = onNavigate;
		this.store = store;
		const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`);
		formNewBill.addEventListener("submit", this.handleSubmit);
		const file = this.document.querySelector(`input[data-testid="file"]`);
		file.addEventListener("change", this.handleChangeFile);
		this.file = null;
		this.fileUrl = null;
		this.fileName = null;
		this.billId = null;
		new Logout({ document, localStorage, onNavigate });
	}
	handleChangeFile = (e) => {
		e.preventDefault();
		const file = this.document.querySelector(`input[data-testid="file"]`).files[0];
		const msgWarning = this.document.querySelector('p[data-testid="warning"]');

		// Si le type de fichier est le bon, on memorise le nom de fichier et on cache le message d'erreur
		if (file.name.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG)$/)) {
			msgWarning.classList.add("hidden");
			const filePath = e.target.value.split(/\\/g);
			const fileName = filePath[filePath.length - 1];
			this.file = file;
	    this.fileName = fileName;
		} else {
			// Sinon on ne traite pas et on affiche le message d'erreur
			msgWarning.classList.remove("hidden");
			this.document.querySelector(`input[data-testid="file"]`).value = "";
		}
	};
	handleSubmit = (e) => {
		e.preventDefault();
		const email = JSON.parse(localStorage.getItem("user")).email;

		const formData = new FormData();
		formData.append("file", this.file);
		formData.append("email", email);

		const bill = {
			email,
			type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
			name: e.target.querySelector(`input[data-testid="expense-name"]`).value,
			amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
			date: e.target.querySelector(`input[data-testid="datepicker"]`).value,
			vat: e.target.querySelector(`input[data-testid="vat"]`).value,
			pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20,
			commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
			fileUrl: this.fileUrl,
			fileName: this.fileName,
			status: "pending",
		};

		this.store
			.bills()
			.create({
				data: formData,
				headers: {
					noContentType: true,
				},
			})
			.then(({ fileUrl, key }) => {
				this.billId = key;
				this.fileUrl = fileUrl;
				this.updateBill(bill)
			})
			.catch((error) => console.error(error));

		this.onNavigate(ROUTES_PATH["Bills"]);
	};

	// not need to cover this function by tests
	/* istanbul ignore next */
	updateBill = (bill) => {
		if (this.store) {
			this.store
				.bills()
				.update({ data: JSON.stringify(bill), selector: this.billId })
				.then(() => {
					this.onNavigate(ROUTES_PATH["Bills"]);
				})
				.catch((error) => console.error(error));
		}
	};
}

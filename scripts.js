const Modal = {
    // Desafio: Trocar as funções open/close por toggle
    open(){
        document
            .querySelector('.modal-overlay')
            .classList
            .add('active')
    },
    close(){
        document
            .querySelector('.modal-overlay')
            .classList
            .remove('active')
    }
}

const Welcome = {
    open(){
        document
            .querySelector('.wrapper')
            .classList
            .add('active')
        document
            .querySelector('.welcome')
            .classList
            .add('active')        
    },
    close(){
        Modal.open()

        document
            .querySelector('.wrapper')
            .classList
            .remove('active')
        document
            .querySelector('.welcome')
            .classList
            .remove('active')
    }
}

// ~ Armazenamento no Local Storage
const Storage = {
    get(){
        return JSON.parse(localStorage.getItem('dev.finances: transactions')) || []
    },
    set(transactions){
        localStorage.setItem("dev.finances: transactions", JSON.stringify(transactions))
    }
}

const Transaction = {
    all: Storage.get(),

    add(transaction){
        Transaction.all.push(transaction)
        App.reload()
    },

    remove(index){
        Transaction.all.splice(index, 1)
        App.reload()
    },

    incomes(){
        let income = 0
        Transaction.all.forEach(transaction => {
            if(transaction.amount > 0){
                income = income + transaction.amount;
            }
        })
        return income
    },
    expenses(){
        let expense = 0
        Transaction.all.forEach(transaction => {
            if(transaction.amount < 0){
                expense = expense + transaction.amount;
            }
        })
        return expense
    },
    total(){
        return Transaction.incomes() + Transaction.expenses()
    }
}

const DOM = {
    
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index){
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index
        
        DOM.transactionsContainer.appendChild(tr)
    },

    innerHTMLTransaction(transaction, index){
        const CSSclass = transaction.amount > 0 ? "income" : "expense"

        const amount = Utils.formatCurrency(transaction.amount)

        const html = 
        `
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img 
                    onclick="Transaction.remove(${index})" 
                    src="./assets/minus.svg" 
                    alt="Remover Transação">
            </td>
        `
        return html
    },

    updateBalance(){
        document
            .getElementById('incomeDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.incomes())
        document
            .getElementById('expenseDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.expenses())


        document
            .getElementById('totalDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.total())

         Utils.totalColor()
    },

    clearTransactions(){
        DOM.transactionsContainer.innerHTML = ""
    }
}

const Utils = {

    totalColor(){
        let totalValueDisplay = document.getElementById('totalDisplay').innerHTML
        let backgroundValue = document.querySelector('.total')

        totalValueDisplay[0] === '-'
         ? backgroundValue.style.backgroundColor = '#e92929'
         : backgroundValue.style.backgroundColor = '#49aa26'
    },

    formatAmount(value){
        value = Number(value) * 100
        
        return value
    },

    formatDate(date){
        // split() = separa em arrays a partir do caractere indicado no parâmetro
        const splittedDate = date.split('-')
        const formattedDate = `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`

        return formattedDate
    },

    formatCurrency(value){
        const signal = Number(value) < 0 ? "- " : ""

        value = String(value).replace(/\D/g, "")
        value = Number(value) / 100
        value = value.toLocaleString("pt-BR", { 
            style: "currency",
            currency: "BRL"
        })

        return signal + value
    }
}

const Form = {

    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues(){
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value, 
        }
    },

    validateFields(){
        const { description, amount, date } = Form.getValues()
        
        //trim() = elimina espaços vazios de uma string
        if( description.trim() === "" || 
            amount.trim() === "" || 
            date.trim() === "") {
                throw new Error("Por favor, preencha todos os campos.")
        }
    },

    formatValues(){
        let { description, amount, date } = Form.getValues()
        
        amount = Utils.formatAmount(amount)
        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }
    },

    saveTransaction(transaction){
        Transaction.add(transaction)
    },

    clearFields(){
        Form.description.value = ''
        Form.amount.value = ''
        Form.date.value = ''
    },

    submit(event){
        // evitar comportamento padrão do HTML (enviar dados do form por URL)
        event.preventDefault()

        try {
            Form.validateFields()
            const transaction = Form.formatValues()
            Form.saveTransaction(transaction)
            Form.clearFields()
            Modal.close()

        } catch (error) {
            alert(error.message)
        }
    }
}
// ~ Iniciar aplicativo
const App = {
    init(){
        
        Transaction.all == '' ? Welcome.open() : console.log('Não fazer nada'),

        // ou Transaction.all.forEach(DOM.addTransaction)
        Transaction.all.forEach((transaction, index) => {
            DOM.addTransaction(transaction, index)
        })

        DOM.updateBalance()
        Storage.set(Transaction.all)
    },   

    reload(){
        DOM.clearTransactions()
        Storage.set(Transaction.all)

        App.init()
    },
}

App.init()
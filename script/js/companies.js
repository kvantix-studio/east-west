import {getList, executeREST} from './crm_requests.js';

class Companies {

    constructor() {
        this.file = '';
        this.users = [];
        this.selects = [];
        this.checkBoxes = [];
        this.list = '';
        this.companies = [];
        this.filtered = [];
        this.init();
    }

    async init() {
        try {
            this.file = await getList('crm.company.list', {
                'order': {'DATE_CREATE': 'DESC'},
                'filter': [],
                'select': ['TITLE', 'ASSIGNED_BY_ID', 'UF_*']
            });
            this.file.forEach(data => {
                this.companies.push(new Company(data));
            });
            let users = await executeREST('user.get', {});
            this.users = users['result'];
            this.selects = document.querySelectorAll('.company-block__select');
            this.checkBoxes = document.querySelectorAll('input[type="checkbox"]');
            this.list = document.querySelector('.company-list__wrapper');
            this.assignedById();
            this.addEventHandlers();
            this.render();
            this.calc();
        }
        finally {
            
        }
    }

    async getFile(url) {
        const d = await fetch(url);
        return await d.json();
    }

    addEventHandlers() {
        this.selects.forEach(select => {
            select.addEventListener('change', () => { this.render(); });
        });
        this.checkBoxes.forEach(checkBox => {
            checkBox.addEventListener('change', () => { this.render(); });
        });
    }

    filter() {
        this.filtered = [];
        this.companies.forEach(company => {
            let push = true;
            this.selects.forEach(select => {
                if (company.data[select.dataset.title] != select.value && select.value != 'any') {
                    push = false;
                }
            });
            this.checkBoxes.forEach(checkBox => {
                if (checkBox.checked && company.data[checkBox.dataset.title] != checkBox.dataset.value) {
                    push = false;
                }
            });
            if (push) this.filtered.push(company);
        });
        
        this.calc()
    }

    render() {
        this.filter();
        if (this.filtered.length != 0) {
            let str = '';
            let num = 0;
            this.filtered.forEach(company => {
                let user = this.users.find(user => user.ID == company.data.ASSIGNED_BY_ID);
                str += company.render(++num, user);
            });
            this.list.innerHTML = str;
        } else {
            this.list.innerHTML = `<div class="company-list__item">
                                        <div class="company-list__empty">Компании не найдены</div>
                                    </div>`;
        }
    }

    async assignedById() {
        this.assignedById.list = [];
        const select = document.querySelector('select[data-title="ASSIGNED_BY_ID"]');
        for (let i = 0; i < this.companies.length; i++) {
            let id = this.companies[i].data['ASSIGNED_BY_ID'];
            if (!this.assignedById.list[id]) {
                this.assignedById.list[id] = id;
                let user = this.users.find(user => user.ID == id);
                let option = new Option(`${user.LAST_NAME} ${user.NAME}`, id);
                select.add(option);
            }
        }
    }

    calc() {
        let sum = 0;
        let difference = 0;
        this.filtered.forEach(company => {
            sum += company.data['UF_CRM_1592318645774'] ? +company.data['UF_CRM_1592318645774'] : 0;
            difference += company.data['UF_CRM_1592318662799'] ? +company.data['UF_CRM_1592318662799'] : 0;
        });
        document.querySelector('.company-block__num.quantity').textContent = this.filtered.length;
        document.querySelector('.company-block__num.sum').textContent = sum;
        document.querySelector('.company-block__num.difference').textContent = difference;
    }

}

class Company {

    constructor(data) {
        this.data = data;
    }

    render(num, user) {
        return `<div class="company-list__item">
                    <div class="company-list__num">${num}</div>
                    <div class="company-list__name">${this.data.TITLE}</div>
                    <div class="company-list__assigned-by-id">${user.LAST_NAME} ${user.NAME}</div>
                    <div class="company-list__price">${this.data.UF_CRM_1592318645774 ? this.data.UF_CRM_1592318645774 : '-'}</div>
                    <div class="company-list_calc">${this.data.UF_CRM_5EE8D58C70C04 ? this.data.UF_CRM_5EE8D58C70C04 : '-'}</div>
                    <div class="company-list__difference">${this.data.UF_CRM_1592318662799 ? this.data.UF_CRM_1592318662799 : '-'}</div>
                </div>`;
    }

}

const companies = new Companies();
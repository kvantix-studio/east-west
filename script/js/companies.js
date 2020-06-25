import {getList, executeREST} from './crm_requests.js';

class Companies {

    constructor() {
        this.file = '';
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
            this.selects = document.querySelectorAll('.company-block__select');
            this.checkBoxes = document.querySelectorAll('input[type="checkbox"]');
            this.list = document.querySelector('.company-list__wrapper');
            this.assignedById();
            this.addEventHandlers();
            this.render();
        }
        finally {
            console.log('Список компаний загружен');
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
    }

    render() {
        this.filter();
        if (this.filtered.length != 0) {
            let str = '';
            this.filtered.forEach(data => {
                str += data.element;
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
                let user = await executeREST('user.get', {"ID": id});
                user = user['result'][0];
                let option = new Option(`${user['LAST_NAME']} ${user['NAME']}`, id);
                select.add(option);
            }
        }
    }

}

class Company {

    constructor(data) {
        this.data = data;
        this.element = this.render();
    }

    render() {
        return `<div class="company-list__item">
                    <div class="company-list__num">${this.data.ID}</div>
                    <div class="company-list__name">${this.data.TITLE}</div>
                    <div class="company-list__price">${this.data.UF_CRM_1592318645774 ? this.data.UF_CRM_1592318645774 : '-'}</div>
                    <div class="company-list_calc">${this.data.UF_CRM_5EE8D58C70C04 ? this.data.UF_CRM_5EE8D58C70C04 : '-'}</div>
                    <div class="company-list__difference">${this.data.UF_CRM_1592318662799 ? this.data.UF_CRM_1592318662799 : '-'}</div>
                </div>`;
    }

}

const companies = new Companies();
import { executeREST, getList } from './crm_requests.js';

class Calendar {
    constructor() {
        this.dates = [];
        this.init();
    }

    async init() {
        $('.input-daterange').datepicker({format: "yyyy/mm/dd", language: "ru"});
        this.companies = await this.companyList();
        const dateArray = $(".input-sm.form-control").change(() => { this.loadDates(); });
        this.loadDates();
    }
    
    loadDates () {
        const start = new Date(document.querySelector('.form-control-start').value);
        const end = new Date(document.querySelector('.form-control-end').value);
        Date.prototype.addDays = function(days) {
            let date = new Date(this.valueOf());
            date.setDate(date.getDate() + days);
            return date;
        }
        this.dates = this.getDates(start, end);
        this.render();
    }
    
    getDates(startDate, stopDate) {
        let dateArray = new Array();
        let currentDate = startDate;
        while (currentDate <= stopDate) {
            let newDate = new Date (currentDate);
            const dateTimeFormat = new Intl.DateTimeFormat('ru', { year: '2-digit', month: 'numeric', day: 'numeric' });
            const [{ value: day },,{ value: month },,{ value: year }] = dateTimeFormat .formatToParts(newDate);
            dateArray.push(`${day}.${month}.${year}`);
            currentDate = currentDate.addDays(1);
        }
        return dateArray;
    }

    async companyList() {
        let list = await getList(
            'crm.company.list', 
            { 
                order: { },
                filter: { },
                select: [ "ID", "TITLE" ]				
            }
        );
        return list;
    }
    
    async tasksList() {
        let list = await getList(
            'tasks.task.list', 
            { 
                order: { },
                filter: { },
                select: [ "ID", "TITLE", "DESCRIPTION", "STATUS", "UF_CRM_TASK" ]				
            }
        );
        return list;
    }
    
    async item() {
        let a = await executeREST(
            'tasks.task.getFields', {}
        );
        
        return a['result'];
    }
    
    async render () {
        let str = '';
        this.companies.forEach((company, i) => {
            str += `
                <div class="calendar-company__item">
                    <div class="calendar-company__link">
                        <div class="calendar-company__num">${i+1}</div>
                        <div class="calendar-company__name">${company['TITLE']}</div>
                    </div>
                    <div class="calendar-company__list">`;
            this.dates.forEach(() => {
                str += `<div class="calendar-company__li"></div>`
            })
            str += `</div></div>`;
        });
        document.querySelector('.calender-company__list-wrapper').innerHTML = str;
    
        let str2 = '';
    
        this.dates.forEach(() => {
            str2 += `<div class="calendar-company__li"></div>`
        })
        document.querySelector('.calendar-company__list').innerHTML = str2;
    
        let str3 = '';
    
        this.dates.forEach((data) => {
            str3 += `<div class="calendar-company__li-data data"><div>${data}</div></div>`
        })
        document.querySelector('.calendar-company__list-date').innerHTML = str3;
    }
    
    async modalRender() {
        let tasks = await tasksList();
        tasks = tasks[0]['tasks'];
        let modalContent = '';
    
        tasks.forEach((el, i) => {
            modalContent += `
                <div class="task-list__item">
                    <div class="task-list__num">${i+1}</div>
                    <div class="task-list__name">${el['description']}</div>
                    <div class="task-list__status">${el['status']}</div>
                    <div class="task-list__action"><button class="task-list__btn">Завершить</button></div>
                </div>
            `;
        });
        
        
        document.querySelector('.task-list__body').innerHTML = modalContent;
    }

}

const calendar = new Calendar();
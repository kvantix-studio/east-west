import { executeREST, getList } from './crm_requests.js';

class Calendar {
    constructor() {
        this.companies = [];
        this.filtered = [];
        this.dates = [];
        this.users = [];
        this.table = '';
        this.init();
    }

    async init() {
        $('.input-daterange').datepicker({format: "yyyy/mm/dd", language: "ru"});
        this.companies = await getList('crm.company.list', { select: [ "ID", "TITLE" ] });
        let users = await executeREST('user.get', {});
        this.users = users['result'];
        this.tasks = await this.tasksList();
        this.table = document.querySelector('.calender-company__list-wrapper');
        const dateArray = $(".input-sm.form-control").change(() => { this.loadDates(); });
        this.initDates();
        this.loadDates();
        this.responsibles();
        document.querySelector('.load').remove();
        document.querySelector('.calendar-search__input').addEventListener('input', () => {this.loadDates();})
        document.querySelector('.calendar-responsible__select').addEventListener('change', () => {this.loadDates();})
        this.calc();
    }
    
    async loadDates () {
        const start = new Date(document.querySelector('.form-control-start').value);
        const end = new Date(document.querySelector('.form-control-end').value);
        Date.prototype.addDays = function(days) {
            let date = new Date(this.valueOf());
            date.setDate(date.getDate() + days);
            return date;
        }
        this.dates = this.getDates(start, end);
        this.filter();
        this.render();
        this.table.onclick = event => {
            if (event.target.classList.contains('calendar-company__li')) {
                if (event.target.classList.length > 1) {
                    this.modalRender(event.target.dataset.date, event.target.dataset.id);
                } else {
                    this.modalCreateTask(event.target.dataset.date, event.target.dataset.id)
                }
            }
        };
    }
    
    formatDate(date, init) {
        if (date == null) return null;
        date = Date.parse(date);
        const dateTimeFormat = new Intl.DateTimeFormat('ru', { year: 'numeric', month: 'numeric', day: 'numeric' });
        const [{ value: day },,{ value: month },,{ value: year }] = dateTimeFormat.formatToParts(date);
        return init ? `${year}/${month}/${day}` : `${day}.${month}.${year}`;
    }

    getDates(startDate, stopDate) {
        let dateArray = new Array();
        let currentDate = startDate;
        while (currentDate <= stopDate) {
            let newDate = new Date (currentDate);
            dateArray.push(this.formatDate(newDate));
            currentDate = currentDate.addDays(1);
        }
        return dateArray;
    }

    initDates() {
        const start = document.querySelector('.form-control-start');
        const end = document.querySelector('.form-control-end');
        const today = new Date();
        let notToday = new Date();
        notToday.setDate(today.getDate() - 30);
        start.value = this.formatDate(notToday, true);
        end.value = this.formatDate(today, true);
    }
    
    async tasksList() {
        let list = await getList(
            'tasks.task.list', 
            {
                select: [ "ID", "TITLE", "DESCRIPTION", "STATUS", "UF_CRM_TASK", "DEADLINE", "RESPONSIBLE_ID", "TAG" ]				
            }
        );
        list[0]['tasks'].forEach(task => {
            task.deadline = this.formatDate(task.deadline);
            if (task.ufCrmTask[0]) {
                task.ufCrmTask[0] = task.ufCrmTask[0].replace(/(\D+)(\d+)/, '$2');
            }
        })
        console.log(list[0]['tasks'])
        return list[0]['tasks'];
    }
    
    getStatusClass(companyId, date) {
        const responsible = document.querySelector('.calendar-responsible__select').value;
        let statuses = this.tasks.map(task => {
            if (task.ufCrmTask == companyId && task.deadline == date && (responsible == task.responsibleId || responsible == 'any')) {
                return task.status;
            }
        });
        if (statuses.includes('5') && statuses.includes('7')) {
            return 'status-4';
        } else if (statuses.includes('7') && (statuses.includes('1') || statuses.includes('2') || statuses.includes('3') || statuses.includes('4') || statuses.includes('6'))) {
            return 'status-5';
        } else if (statuses.includes('7')) {
            return 'status-3';
        } else if (statuses.includes('5')) {
            return 'status-2';
        } else if (statuses.includes('1') || statuses.includes('2') || statuses.includes('3') || statuses.includes('4') || statuses.includes('6')) {
            return 'status-1';
        } else {
            return false;
        }
    }

    getStatusText(code) {
        switch (code) {
            case '1':
                return 'Новая задача';
            case '2':
                return 'Задача принята';
            case '3':
                return 'Задача выполняется';
            case '4':
                return 'Условно завершена';
            case '5':
                return 'Задача завершена';
            case '6':
                return 'Задача отложена';
            case '7':
                return 'Задача отклонена';
        }
    }

    render () {
        let str = '';
        this.filtered.forEach((company, i) => {
            str += `
                <div class="calendar-company__item">
                    <div class="calendar-company__link">
                        <div class="calendar-company__num">${i+1}</div>
                        <div class="calendar-company__name">
                            <a target="_blank" href="https://b24-7jxc9k.bitrix24.ru/crm/company/details/${company['ID']}/">
                                ${company['TITLE']}
                            </a>
                        </div>
                    </div>
                    <div class="calendar-company__list">`;
            this.dates.forEach(date => {
                let status = this.getStatusClass(company['ID'], date);
                str += `<div class="calendar-company__li ${status ? status : ''}" data-date="${date}" data-id="${company['ID']}"></div>`
            })
            str += `</div></div>`;
        });
        this.table.innerHTML = str;
    
        let str3 = '';
        this.dates.forEach((data) => {
            str3 += `<div class="calendar-company__li-data data"><div>${data}</div></div>`
        })
        document.querySelector('.calendar-company__list-date').innerHTML = str3;
        
        if (this.filtered.length == 0) {
            const wrapper = document.querySelector('.calender-company__list-wrapper');
            wrapper.innerHTML = `
                <div class="not-found">Нет совпадений</div>
            `;
        }
    }

    calc() {
        let yellow = 0;
        let green = 0;
        let red = 0;
        this.tasks.forEach(task => {
            if (task.status == '5') {
                green++;
            } else if (task.status == '7') {
                red++;
            } else {
                yellow++;
            }
        });
        document.querySelector('.calendar-result__num.yellow').innerHTML = yellow;
        document.querySelector('.calendar-result__num.red').innerHTML = red;
        document.querySelector('.calendar-result__num.green').innerHTML = green;
    }

    filter() {
        this.filtered = [];
        const input = document.querySelector('.calendar-search__input').value.toLowerCase();
        const responsible = document.querySelector('.calendar-responsible__select').value;
        this.companies.forEach(company => {
            if (company['TITLE'].toLowerCase().includes(input)) {
                if (responsible == 'any') {
                    this.filtered.push(company);
                } else {
                    this.tasks.forEach(task => {
                        if (company['ID'] == task.ufCrmTask && responsible == task.responsibleId) {
                            let find = this.filtered.find(x => x.ID == company.ID);
                            if (!find) {
                                this.filtered.push(company);
                            }
                        }
                    })
                }
            }
        })
    }
    
    modalRender(date, id) {
        const responsible = document.querySelector('.calendar-responsible__select').value;
        let modalContent = '';
        let modal = document.createElement('div');
        modal.classList.add('modal-task');
        modalContent += `
            <div class="modal__wrapper">
            <div class="modal__content">
                <span class="modal__close">&times;</span>
                
                <div class="modal__company">
                    <span>Компания:</span> ${this.companies.find(company => company['ID'] == id)['TITLE']}
                </div>
                <div class="modal__task">
                    <span>Срок задач:</span> ${date}
                </div>
                <div class="task-list">
                    <div class="task-list__head">
                        <div class="task-list__num"><span>#</span></div>
                        <div class="task-list__name"><span>Задача</span></div>
                        <div class="task-list__status"><span>Статус</span></div>
                        <div class="task-list__action"><span>Действие</span></div>
                    </div>
                    <div class="task-list__body">`;
    
        let i = 0;
        this.tasks.forEach(task => {
            if (task.ufCrmTask == id && task.deadline == date && (responsible == task.responsibleId || responsible == 'any')) {
                modalContent += `
                    <div class="task-list__item">
                        <div class="task-list__num">${++i}</div>
                        <div class="task-list__name">${task['description'] ? task['description'] : '-'}</div>
                        <div class="task-list__status" data-taskid="${task['id']}">${this.getStatusText(task['status'])}</div>
                        <div class="task-list__action"><button class="task-list__btn" data-taskid="${task['id']}">Завершить</button></div>
                    </div>
                `;
            }
        });
        
        modalContent += `   
                    </div>
                </div>
                <button class="modal__cancel-btn">Отмена</button>
                <button class="modal__create-task-btn">Создать задачу</button>
            </div>
            <!-- /.modal__content -->
            </div>
            <!-- /.modal__wrapper -->`;

        modal.innerHTML = modalContent;
        document.body.append(modal);
        modal.addEventListener('click', event => {
            if (event.target.className == 'modal__close' || event.target.className == 'modal__cancel-btn' || event.target.className == 'modal__wrapper') {
                event.currentTarget.remove();
            } else if (event.target.className == 'task-list__btn') {
                executeREST(
                    'tasks.task.complete', 
                    { 
                        taskId:	event.target.dataset.taskid
                    }
                );
                document.querySelector(`div.task-list__status[data-taskid="${event.target.dataset.taskid}"]`).textContent = 'Задача завершена';
                document.location.reload(true);
            } else if (event.target.className == 'modal__create-task-btn') {
                this.modalCreateTask(id);
            }
        });
    }

    modalCreateTask(date, id) {
        let modalCreateContent = '';

        let modalCreateTask = document.createElement('div');
        modalCreateTask.classList.add('modal-create-task');

        modalCreateContent += `
            <div class="modal__wrapper">
                <div class="modal__content">
                    <span class="modal__close">&times;</span>
                    <div class="modal__container">
                        <div class="task-item">
                            <label class="task__text" for="task-name">Название задачи:</label>
                            <input class="task__input" type="text" name="task-name" id="task-name">
                        </div>
                        <div class="task-item">
                            <label class="task__text" for="task-name">Описание задачи:</label>
                            <input class="task__input" type="text" name="task-name" id="task-descr">
                        </div>
                        <div class="task-item">
                            <label class="task__text" for="task-manager">Ответственный:</label>
                            <select class="task__input calendar-responsible__select" name="task-manager" id="task-manager">`;

        this.users.forEach(user => {
            modalCreateContent += `<option value="${user.ID}">${user.LAST_NAME} ${user.NAME}</option>`;
        });
                                
        modalCreateContent += `
                            </select>
                        </div>
                        <div class="task-item">
                            <label class="task__text" for="task-tags">Теги:</label>
                            <input class="task__input task-tags" type="text" id="task-tags">
                        </div>
                    </div>
                    <button class="modal__cancel-btn">Отмена</button>
                    <button class="modal__create-btn">Сохранить задачу</button>
                </div>
                <!-- /.modal__content -->
            </div>
            <!-- /.modal__wrapper -->
        `;

        modalCreateTask.innerHTML = modalCreateContent;
        document.body.append(modalCreateTask);

        modalCreateTask.addEventListener('click', event => {
            if (event.target.className == 'modal__close' || event.target.className == 'modal__cancel-btn' || event.target.className == 'modal__wrapper') {
                event.currentTarget.remove();
            } else if (event.target.className == 'modal__create-btn') {
                executeREST(
                    'tasks.task.add', 
                    { 
                        fields:{
                            TITLE: `${document.querySelector('#task-name').value}`, 
                            DESCRIPTION: `${document.querySelector('#task-descr').value}`, 
                            RESPONSIBLE_ID: `${document.querySelector('#task-manager').value}`,
                            DEADLINE: date,
                            UF_CRM_TASK: [`CO_${id}`],
                        }
                    }
                );
                event.currentTarget.remove();
                document.location.reload(true);
            }
            
        });

    }

    responsibles() {
        const select = document.querySelector('.calendar-responsible__select');
        this.users.forEach(user => {
            const option = new Option(`${user.LAST_NAME} ${user.NAME}`, `${user.ID}`);
            select.add(option);
        })
    }

}

const calendar = new Calendar();
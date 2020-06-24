class Settings {

    constructor() {
        this.file = [];
        this.element = '';
        this.items = [];
        this.init();
    }

    async getFile(url) {
        const d = await fetch(url);
        return await d.json();
    }

    async init() {
      try {
        this.file = await this.getFile('settings.json');
        this.file.forEach(data => {
          let newItem = new Item(data);
          this.items.push(newItem);
        });
        this.element = document.querySelector('.settings__wrapper');
        this.render();
        this.accordion();
        document.querySelector('#save-btn').onclick = () => { this.save(); };
      }
      finally {
        console.log('Настройки загружены');
      }
    }

    render() {
      this.items.forEach(item => {
        this.element.append(item.element);
      });
    }

    accordion() {
      const items = document.querySelectorAll('.settings-item');
      items.forEach(item => {
          item.addEventListener('click', event => {
              if (event.target.classList.contains('settings__title')) {
                  event.currentTarget.lastChild.classList.toggle('active');
              }
          })
      });
    }

    save() {
      const items = document.querySelectorAll('.settings-item');
      items.forEach(item => {
        const fileSelect = this.file.findIndex(x => x.id == item.dataset.id);
        const options = item.querySelectorAll('.settings__input');
        options.forEach(option => {
          const fileOption = this.file[fileSelect].options.findIndex(x => x.text == option.dataset.text);
          this.file[fileSelect].options[fileOption].value = option.value;
        });
      });
      let request = new XMLHttpRequest();
      request.open("POST", "./script/php/save_settings.php", true);
      request.setRequestHeader("Content-type", "application/json");
      request.send(JSON.stringify(this.file));
      document.location.reload();
    }

}

class Item {

  constructor(data) {
    this.data = data;
    this.element = '';
    this.render();
  }

  render() {
    this.element = document.createElement('div');
    this.element.className = 'settings-item';
    this.element.dataset.id = this.data.id;
    let str = `
      <div class="settings__title">${this.data.name}</div>
      <div class="settings-item__wrapper">
    `;
    this.data.options.forEach(option => {
      str += `
        <div class="settings__text">${option.text}</div>
        <input class="settings__input" type="text" value="${option.value}" data-text="${option.text}">
      `;
    });
    str += `</div>`;
    this.element.innerHTML = str;
  }

}

let settings = new Settings();

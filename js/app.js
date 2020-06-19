class Calculator {

  constructor() {
    this.form = document.querySelector('.calc-form');
    this.file = [];
    this.selects = [];
    this.sum = 0;
    this.init();
  }

  async getFile(url) {
    const d = await fetch(url);
    return await d.json();
  }

  handleEvents() {
    for (let i = 0; i < this.selects.length; i++) {
      let select = this.selects[i];
      select.element.addEventListener('change', () => this.reload());
    }
  }

  reload() {
    this.selects.forEach(select => {
      if (Object.keys(select.data["fkSelect"]).length != 0) {
        if (select.getSubsections()) {
          this.addSubsections(select);
        } else {
          this.deleteSubsections(select);
        }
      }
      if (Object.keys(select.data["fkOption"]).length != 0) {
        if (select.getDisabledOptions()) {
          this.addDisabledOptions(select);
        } else {
          this.deleteDisabledOptions(select);
        }
      }
    });
    this.render();
    this.calc();
  }

  addDisabledOptions(select) {
    for (const option in select.data["fkOption"]) {
      for (const disabled in select.data["fkOption"][option]) {
        let selectWithDisabled = this.selects.find(x => x.data["id"] == disabled);
        let text = select.data["fkOption"][option][disabled];
        selectWithDisabled.addDisabled(text);
      }
    }
  }

  deleteDisabledOptions(select) {
    for (const key in select.data["fkOption"]) {
      let fkOption = select.data["fkOption"][key];
      for (const option in fkOption) {
        let find = this.selects.find(x => x.data.id == option);
        find.deleteDisabled(fkOption[option]);
      }
    }
  }

  addSubsections(select) {
    let option = select.getSubsections();
    let links = select.data["fkSelect"][option];
    for (let i = 0; i < links.length; i++) {
      let find = this.selects.find(x => x.data["id"] == links[i]);
      if (!find) {
        let data = this.file.find(x => x.id == links[i]);
        let newSelect = new Select(data);
        newSelect.element.addEventListener('change', () => this.reload());
        this.selects.push(newSelect);
      }
    }
  }

  deleteSubsections(select) {
    for (const key in select.data["fkSelect"]) {
      for (let i = 0; i < select.data["fkSelect"][key].length; i++) {
        let find = this.selects.find(x => x.data["id"] == select.data["fkSelect"][key][i]);
        if (find) {
          this.selects.splice(this.selects.indexOf(find));
        }
      }
    }
  }

  render() {
    this.form.innerHTML = '';
    for (let i = 0; i < this.selects.length; i++) {
      let select = this.selects[i];
      this.form.append(select.element);
    }
  }

  async init() {
    try {
      this.file = await this.getFile('data.json');
      this.file.forEach(select => {
        if (select["type"] === "section") {
          let newSelect = new Select(select);
          this.selects.push(newSelect);
        }
      });
      this.handleEvents();
      this.reload();
    }
    finally {
      console.log('Успешно');
    }
  }

  calc() {
    this.sum = 0;
    this.selects.forEach(select => {
      let selectTag = select.element.querySelector('select');
      this.sum += +selectTag.options[selectTag.selectedIndex].value;
      document.getElementById('sum').innerHTML = this.sum;
    });
  }

}

class Select {

  constructor(data) {
    this.data = data;
    this.element = '';
    this.init();
  }

  init() {
    this.element = document.createElement('div');
    this.element.className = 'calc-item';

    let title = document.createElement('div');
    title.className = 'calc-item__title';
    title.textContent = this.data.name;
    this.element.append(title);

    let select = document.createElement('select');
    select.className = 'calc-item__select';
    this.data.options.forEach(option => {
      if (!option.disabled) {
        let newOption = new Option(option.text, option.value, option.selected ? true : false);
        select.add(newOption);
      }
    });
    this.element.append(select);
    
    return this.element;
  }

  addDisabled(text) {
    let find = this.data.options.find(x => x.text == text);
    let disabled = new Option(find.text, find.value, find.selected ? true : false);
    let options = this.element.querySelectorAll('option');
    let option = Array.from(options).find(x => x.text == text);
    if (!option) {
      this.element.querySelector('select').add(disabled);
    }
  }

  deleteDisabled(text) {
    let options = this.element.querySelectorAll('option');
    let disabled = Array.from(options).find(x => x.text == text);
    if (disabled) disabled.remove();
  }

  getText() {
    let select = this.element.querySelector('select');
    let text = select.options[select.selectedIndex].text;
    return text;
  }

  getSubsections() {
    let find = Object.keys(this.data["fkSelect"]).find(option => option == this.getText());
    return find ? find : false;
  }

  getDisabledOptions() {
    let find = Object.keys(this.data["fkOption"]).find(option => option == this.getText());
    return find ? find : false;
  }

}

let calculator = new Calculator();

const tabLinks = document.querySelectorAll(".tabs a"),
      tabPanels = document.querySelectorAll(".tabs-panel");

for (let el of tabLinks) {
  el.addEventListener("click", event => {
    event.preventDefault();

    document.querySelector(".tabs li.active").classList.remove("active");
    document.querySelector(".tabs-panel.active").classList.remove("active");

    const parentListItem = el.parentElement;
    parentListItem.classList.add("active");
    const index = [...parentListItem.parentElement.children].indexOf(parentListItem);

    const panel = [...tabPanels].filter(el => el.getAttribute("data-index") == index);
    panel[0].classList.add("active");
  });
}
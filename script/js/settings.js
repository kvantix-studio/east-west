class Settings {
    constructor() {
        this.file = [];
        this.init();
    }
    async getFile(url) {
        const d = await fetch(url);
        return await d.json();
    }

    async init() {
      try {
        this.file = await this.getFile('data.json');
        console.log(this.file);
      }
      finally {
        console.log('Ok');
      }
    }
}

class Item {
  constructor(data) {
    this.data = data;

  }

  init() {
    
  }

}

let settings = new Settings();

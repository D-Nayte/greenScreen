// @ts-nocheck

class MockI2CBus {
  constructor() {}
  async init() {
    console.log('RUNN!');
  }
  // Mock-Funktionen hier hinzufügen
}

const bm2 = new MockI2CBus({ test: 2 });
console.log('bm2 :>> ', bm2);

// Exportieren Sie die Klasse direkt, anstatt sie in einem Objekt zu verpacken
export default MockI2CBus;

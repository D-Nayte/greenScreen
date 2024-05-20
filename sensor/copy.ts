// @ts-nocheck

class MockI2CBus {
  constructor() {}
  async init() {
    console.info('Mocking I2C Bus - RUNN');
  }
  // Mock-Funktionen hier hinzufügen
}

const bm2 = new MockI2CBus({ test: 2 });

// Exportieren Sie die Klasse direkt, anstatt sie in einem Objekt zu verpacken
export default MockI2CBus;

describe('Global CSS', () => {
  it('should be imported by layout', () => {
    const layoutFile = require('fs').readFileSync('./client/app/layout.tsx', 'utf8');
    expect(layoutFile).toContain("import './globals.css'");
  });
});
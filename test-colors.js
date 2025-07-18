// Simple test to verify our color changes
// This would normally be run with Node.js

const kleur = require('kleur');

class LoggerUtil {
  info(message) {
    // Sky blue for informational messages
    console.info(kleur.hex('#81D4FA')(message))
  }

  success(message) {
    // Forest green for success messages
    console.info(kleur.hex('#2E7D32')(message))
  }

  log(message) {
    console.log(message)
  }

  error(message) {
    // Keep red for errors but use a softer tone
    console.error(kleur.hex('#D32F2F')(message))
  }

  // Renamed from purple to primary for better semantic meaning
  primary(message) {
    // Moss green for primary output
    console.info(kleur.hex('#7CB342')(message))
  }

  // Keep purple method for backward compatibility
  purple(message) {
    this.primary(message)
  }

  // New method for secondary information
  secondary(message) {
    // Cool grey for secondary information
    console.info(kleur.hex('#78909C')(message))
  }
}

// Test the colors
const log = new LoggerUtil();

console.log('\n🌱 EcoInfra Color Palette Test\n');

log.success('✅ Success: Analysis complete! Forest green (#2E7D32)');
log.primary('📊 Primary: Emission data processed. Moss green (#7CB342)');
log.info('ℹ️  Info: Connecting to API... Sky blue (#81D4FA)');
log.secondary('📝 Secondary: Additional details. Cool grey (#78909C)');
log.error('❌ Error: Connection failed. Soft red (#D32F2F)');

console.log('\n🎨 New earthy, sustainable color scheme applied!\n');

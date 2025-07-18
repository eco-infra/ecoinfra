import kleur from 'kleur';

export default class LoggerUtil {
  info(message: string) {
    // Sky blue for informational messages
    console.info(kleur.hex('#81D4FA')(message))
  }

  success(message: string) {
    // Forest green for success messages
    console.info(kleur.hex('#2E7D32')(message))
  }

  log(message: string) {
    console.log(message)
  }

  error(message: string) {
    // Keep red for errors but use a softer tone
    console.error(kleur.hex('#D32F2F')(message))
  }

  // Renamed from purple to primary for better semantic meaning
  primary(message: string) {
    // Moss green for primary output
    console.info(kleur.hex('#7CB342')(message))
  }

  // Keep purple method for backward compatibility
  purple(message: string) {
    this.primary(message)
  }

  // New method for secondary information
  secondary(message: string) {
    // Cool grey for secondary information
    console.info(kleur.hex('#78909C')(message))
  }
}

import kleur from 'kleur';

export default class LoggerUtil {
  info(message: string) {
    console.info(kleur.cyan(message))
  }

  success(message: string) {
    console.info(kleur.green(message))
  }

  log(message: string) {
    console.log(message)
  }

  error(message: string) {
    console.error(kleur.red(message))
  }

  purple(message: string) {
    console.info(kleur.magenta(message))
  }
}

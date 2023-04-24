# BBVABlockchainChecks

Este repositorio contiene el código fuente de un proyecto React que integra un contrato inteligente de cheques NFT en la red Ethereum.

## Requisitos previos

- Node.js (versión 14.x o superior) instalado en tu computadora. Puedes descargarlo desde [aquí](https://nodejs.org/en/).
- [MetaMask](https://metamask.io/) instalado en tu navegador.

## Instalación y configuración

1. Clona el repositorio en tu computadora local:

```
git clone https://github.com/RamiroPeidro/BBVABlockchainChecks.git
```

2. Entra en la carpeta del proyecto:

```
cd BBVABlockchainChecks
```

3. Instala las dependencias del proyecto:

```
npm install
```

4. Crea un archivo `.env` en la raíz del proyecto y agrega las variables de entorno necesarias, por ejemplo:

```
REACT_APP_NFT_CHEQUE_ABI=<ABI de tu contrato>
REACT_APP_NFT_CHEQUE_ADDRESS=<Dirección del contrato>
```

Reemplaza `<ABI de tu contrato>` y `<Dirección del contrato>` con los valores correspondientes a tu contrato de cheques NFT.

5. Inicia el servidor de desarrollo local:

```
npm start
```

El proyecto se iniciará en el navegador en `http://localhost:3000`.

## Uso

1. Asegúrate de que MetaMask esté instalado en tu navegador y que esté conectado a la red en la que se encuentra tu contrato de cheques NFT (por ejemplo, Ropsten, Rinkeby, etc.).

2. Si aún no lo has hecho, importa la cuenta que deseas utilizar en MetaMask.

3. Navega a `http://localhost:3000` en tu navegador. Verás la cantidad total de cheques en BBVA.

4. Realiza las acciones que desees con el contrato de cheques NFT utilizando los componentes proporcionados en la aplicación.

## Contribución

Si deseas contribuir al proyecto, crea un fork del repositorio, realiza tus cambios y luego crea un pull request.

## Licencia

Este proyecto está licenciado bajo la [Licencia MIT](https://opensource.org/licenses/MIT).

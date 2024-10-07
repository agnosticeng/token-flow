# TokenFlow

TokenFlow is a powerful web-based application that visualizes blockchain token holders and transfer patterns using interactive graphs. Built with **SvelteKit** and **D3.js**, TokenFlow allows you to easily explore top wallets for a given token and analyze transfer volumes between them. The project is backed by Agnostic’s API to retrieve real-time data from the blockchain.

## Features

- Visualizes token holders as nodes, with customizable sizing based on token amounts.
- Interactivity through zooming, dragging, and wallet display toggling.
- Uses Agnostic’s API for seamless access to blockchain data.
- Supports multiple tokens by allowing dynamic input for token addresses.

## Tech Stack

- **SvelteKit**: For building a highly performant and dynamic frontend.
- **D3.js**: To handle the data visualization part of the graph.
- **GraphQL**: Used for querying data via Agnostic’s API.
- **Agnostic API**: Provides access to blockchain data including wallet balances and transfers.
- **SQLite**: Provides labels database for wallet addresses

## Getting Started

Follow these instructions to get a copy of the project running on your local machine.

### Prerequisites

- Node.js installed on your system.
- A GitHub account for cloning the repository.
- Access to the [Agnostic App](https://app.agnostic.com) to retrieve blockchain data.

### Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/agnosticeng/token-flow.git
    cd token-flow
    ```

2. Install the dependencies:
    ```bash
    npm install
    ```

3. Configure your API access:
    - Get an API key from [Agnostic’s platform](https://app.agnostic.com).
    - Set up a `.env` file in the root directory and add your API key:
      ```
      AGNOSTIC_TOKEN=your_api_key_here
      LABELS_DB_URL="libsql://<database-url>"
      LABELS_DB_AUTH_TOKEN=database_auth_token
      GITHUB_TOKEN=<github_personal_auth_token> # redeem dependencies on github packages
      ```

4. Start the development server:
    ```bash
    npm run dev
    ```

5. Open the app in your browser:
    ```
    http://localhost:5173
    ```

## Usage

Once the application is running, you can:

- **Explore Top Token Holders**: Enter the token address and view the top wallets that hold that token.
- **Visualize Transfers**: Analyze transfer volumes between the top holders using the interactive graph.
- **Interactivity**: Use zoom, drag, and toggle functionalities to navigate and interact with the graph.

## GraphQL Queries

The app fetches data using GraphQL queries built from SQL via Agnostic’s API. Below is the queries we use in TokenFlow:
The query are not available globally, you'll have to craft your own queries.

```graphql
query TokenHoldersWithTransfers($token: String!) {
  token_holders(token: $token) {
    wallet
    amount
    percent
  }

  track_transfers_between_holders(token: $token) {
    source
    target
    amount
  }
}
```

## Documentation

For a detailed explanation of how the project works and how we used Agnostic’s API, check out our two-part article series:

- [Unlocking Token Secrets: Mapping Out Top Holders and Transfers - Part 1](https://medium.com/agnosticeng/unlocking-token-secrets-mapping-out-top-holders-and-transfers-part-1-32ac7a0cae0a)
- [Unlocking Token Secrets: Mapping Out Top Holders and Transfers  -  Part 2](https://medium.com/agnosticeng/unlocking-token-secrets-mapping-out-top-holders-and-transfers-part-2-5c900c8e9f0a)

## Contributing

We welcome contributions! If you would like to contribute to this project, please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Make your changes.
4. Submit a pull request.

Please ensure that your code adheres to our coding standards and includes relevant tests.

## License

This project is licensed under the MIT License – see the [LICENSE](LICENSE.md) file for details.

## Acknowledgments

- [Agnostic API](https://app.agnostic.dev) for providing the data.
- The Svelte and D3.js communities for their awesome tools.
- Inspired by modern blockchain data visualization platforms such as **Arkham** and **BubbleMaps**.

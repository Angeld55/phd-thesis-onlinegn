// In case of a change - change the html also
export const D3_CONTAINER_ID = 'd3-container';
export const D3_CONTAINER_SELECTOR = '#' + D3_CONTAINER_ID;

export const MOCK_GLOBAL_CODE = `this.globalObj = {
            tokens: this.tokenMover.tokens, // all tokens ref
            getTokenByName: function (name) {
              return this.tokens.find((token) => token.name === name);
            },
            a: 5, // global variable
            f: function () {  // global function
              let b = this.a + 5;
              console.log(b);
              console.log("All tokens:", this.tokens);
              console.log("Token by name:", this.getTokenByName("token_1"));
            },
            returnTrue: function (token) {
              console.log("Hello, from the return true function with", token);
              return true;
            },
            returnFalse: function () {
              return false;
            },
            splitTokenOnT1: function (token) {
              return token.name === "token_1" || token.name === "token_3";
            },
            functionWithToken: function(token) {
                token.chars["Agd"] = 1;
              console.log(token.chars);
            },
            mergeTokensOnP4: function(tokens) {
              if (tokens.length !== 2) {
                return tokens;
              }
              const newToken = {
                name: "my-new-token",
                chars: { ...tokens[0].chars, ...tokens[1].chars }
              };
              return [newToken];
            },
            test: function() {
              return this.tokens.length;
            }
        }`;

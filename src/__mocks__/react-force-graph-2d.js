// eslint-disable-next-line @typescript-eslint/no-require-imports
const React = require("react");
module.exports = {
  __esModule: true,
  default: ({ onLinkClick }) => {
    global.__mockOnLinkClick = onLinkClick;
    return React.createElement("div", { "data-testid": "force-graph" });
  },
};

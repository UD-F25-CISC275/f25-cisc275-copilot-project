import { render, screen } from "@testing-library/react";

import { App } from "../src/App";

test("App component displays dashboard", () => {
    render(<App />);

    const heading = screen.getByText(/Assignment Dashboard/i);

    expect(heading).toBeInTheDocument();
});

test("App component displays sample assignments", () => {
    render(<App />);

    expect(screen.getByText("Introduction to TypeScript")).toBeInTheDocument();
    expect(screen.getByText("React Hooks")).toBeInTheDocument();
    expect(screen.getByText("Advanced React Patterns")).toBeInTheDocument();
});

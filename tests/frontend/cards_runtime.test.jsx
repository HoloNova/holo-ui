import { test, expect, describe, beforeAll } from "bun:test";
import path from "path";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { GlobalWindow } from "happy-dom";

import { Editorial3DOrbitCarousel } from "../../rewampui-components/components/cards/editorial-3-d-orbit-carousel.snippet.jsx";
import { PerspectiveFlipDeck } from "../../rewampui-components/components/cards/perspective-flip-deck.snippet.jsx";
import { DiagonalCardStack } from "../../rewampui-components/components/cards/diagonal-card-stack.snippet.jsx";

// Setup browser DOM environment using happy-dom
beforeAll(() => {
  const window = new GlobalWindow();
  globalThis.window = window;
  globalThis.document = window.document;
  globalThis.navigator = window.navigator;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  globalThis.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 16);
  globalThis.cancelAnimationFrame = (id) => clearTimeout(id);
});

function renderToDom(element) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(element);
  });
  return {
    container,
    unmount: () => {
      act(() => {
        root.unmount();
      });
      container.remove();
    },
  };
}

describe("Cards Bundle Verification", () => {
  test("Bun.build succeeds with zero errors and no webp imports", async () => {
    const result = await Bun.build({
      entrypoints: [
        path.resolve(import.meta.dir, "../../rewampui-components/components/cards/editorial-3-d-orbit-carousel.snippet.jsx"),
        path.resolve(import.meta.dir, "../../rewampui-components/components/cards/perspective-flip-deck.snippet.jsx"),
        path.resolve(import.meta.dir, "../../rewampui-components/components/cards/diagonal-card-stack.snippet.jsx"),
      ],
      external: ["react", "react-dom", "framer-motion"],
    });
    expect(result.success).toBe(true);
    expect(result.outputs.length).toBe(3);
    for (const output of result.outputs) {
      const code = await output.text();
      expect(code).not.toContain("assets/cards");
    }
  });
});

describe("Editorial3DOrbitCarousel Runtime", () => {
  test("default input renders neutral CSS placeholders without <img>", () => {
    const { container, unmount } = renderToDom(<Editorial3DOrbitCarousel autoTick={false} />);
    const imgs = container.querySelectorAll("img");
    expect(imgs.length).toBe(0);
    expect(container.textContent).toContain("Exhibit 01");
    expect(container.textContent).toContain("Exhibit 05");
    expect(container.innerHTML).not.toContain("NaN");
    unmount();
  });

  test("null items prop gracefully falls back to default neutral placeholders", () => {
    const { container, unmount } = renderToDom(<Editorial3DOrbitCarousel items={null} autoTick={false} />);
    const imgs = container.querySelectorAll("img");
    expect(imgs.length).toBe(0);
    expect(container.textContent).toContain("Exhibit 01");
    expect(container.textContent).toContain("Exhibit 05");
    expect(container.innerHTML).not.toContain("NaN");
    unmount();
  });

  test("custom items with image renders valid <img> elements", () => {
    const customItems = [
      { id: "art-1", image: "/photos/art-1.png", title: "Artwork One" },
      { id: "art-2", image: "/photos/art-2.png", title: "Artwork Two" },
    ];
    const { container, unmount } = renderToDom(
      <Editorial3DOrbitCarousel items={customItems} autoTick={false} />
    );
    const imgs = container.querySelectorAll("img");
    expect(imgs.length).toBe(2);
    expect(imgs[0].getAttribute("src")).toBe("/photos/art-1.png");
    expect(imgs[0].getAttribute("alt")).toBe("Artwork One");
    expect(imgs[1].getAttribute("src")).toBe("/photos/art-2.png");
    expect(imgs[1].getAttribute("alt")).toBe("Artwork Two");
    unmount();
  });

  test("edge cases: empty array and single item do not throw or produce NaN", () => {
    // Empty array
    const { container: emptyContainer, unmount: unmountEmpty } = renderToDom(
      <Editorial3DOrbitCarousel items={[]} autoTick={false} />
    );
    expect(emptyContainer.querySelectorAll("img").length).toBe(0);
    expect(emptyContainer.innerHTML).not.toContain("NaN");
    unmountEmpty();

    // Single item
    const { container: singleContainer, unmount: unmountSingle } = renderToDom(
      <Editorial3DOrbitCarousel items={[{ id: "s1", title: "Solo Card" }]} autoTick={false} />
    );
    expect(singleContainer.querySelectorAll("img").length).toBe(0);
    expect(singleContainer.textContent).toContain("Solo Card");
    expect(singleContainer.innerHTML).not.toContain("NaN");
    unmountSingle();
  });

  test("interaction: click on card updates active step and shifts zIndex order", () => {
    const { container, unmount } = renderToDom(<Editorial3DOrbitCarousel autoTick={false} />);
    const clickableCards = container.querySelectorAll(".pointer-events-auto");
    expect(clickableCards.length).toBe(5);

    // Initial state: Card 0 is the upright center card (zIndex 40), Card 1 has zIndex 30
    expect(clickableCards[0].style.zIndex).toBe("40");
    expect(clickableCards[1].style.zIndex).toBe("30");

    // Click on Card 1 to rotate it to center
    act(() => {
      clickableCards[1].click();
    });

    // After click: Card 1 becomes center (zIndex 40), Card 0 moves back (zIndex 50)
    expect(clickableCards[1].style.zIndex).toBe("40");
    expect(clickableCards[0].style.zIndex).toBe("50");
    expect(container.innerHTML).not.toContain("NaN");
    unmount();
  });
});

describe("PerspectiveFlipDeck Runtime", () => {
  test("default input renders neutral CSS placeholders without <img>", () => {
    const { container, unmount } = renderToDom(<PerspectiveFlipDeck autoPlay={false} />);
    const imgs = container.querySelectorAll("img");
    expect(imgs.length).toBe(0);
    expect(container.textContent).toContain("Deck 01");
    expect(container.textContent).toContain("Deck 05");
    expect(container.innerHTML).not.toContain("NaN");
    unmount();
  });

  test("null items prop gracefully falls back to default neutral placeholders", () => {
    const { container, unmount } = renderToDom(<PerspectiveFlipDeck items={null} autoPlay={false} />);
    const imgs = container.querySelectorAll("img");
    expect(imgs.length).toBe(0);
    expect(container.textContent).toContain("Deck 01");
    expect(container.textContent).toContain("Deck 05");
    expect(container.innerHTML).not.toContain("NaN");
    unmount();
  });

  test("custom items with image renders valid <img> elements", () => {
    const customCards = [
      { id: "c1", image: "/gallery/c1.jpg", title: "Custom Deck 1" },
      { id: "c2", image: "/gallery/c2.jpg", title: "Custom Deck 2" },
    ];
    const { container, unmount } = renderToDom(
      <PerspectiveFlipDeck items={customCards} autoPlay={false} />
    );
    const imgs = container.querySelectorAll("img");
    expect(imgs.length).toBe(2);
    expect(imgs[0].getAttribute("src")).toBe("/gallery/c1.jpg");
    expect(imgs[0].getAttribute("alt")).toBe("Custom Deck 1");
    unmount();
  });

  test("edge cases: empty array and single item do not throw or produce NaN", () => {
    // Empty array
    const { container: emptyContainer, unmount: unmountEmpty } = renderToDom(
      <PerspectiveFlipDeck items={[]} autoPlay={false} />
    );
    expect(emptyContainer.querySelectorAll("img").length).toBe(0);
    expect(emptyContainer.innerHTML).not.toContain("NaN");
    unmountEmpty();

    // Single item
    const { container: singleContainer, unmount: unmountSingle } = renderToDom(
      <PerspectiveFlipDeck items={[{ id: "p-solo", title: "Solo Deck" }]} autoPlay={false} />
    );
    expect(singleContainer.querySelectorAll("img").length).toBe(0);
    expect(singleContainer.textContent).toContain("Solo Deck");
    expect(singleContainer.innerHTML).not.toContain("NaN");
    unmountSingle();
  });

  test("interaction: click stage triggers flip state and waiting for timer advances front card", async () => {
    const { container, unmount } = renderToDom(<PerspectiveFlipDeck autoPlay={false} />);
    const stage = container.querySelector(".cursor-pointer");
    expect(stage).not.toBeNull();

    const getCardDivs = () => stage.children;
    const initialCards = getCardDivs();
    expect(initialCards.length).toBe(5);

    // Initial state: Card 0 is front card at slot 0 (zIndex 30), Card 1 at slot 1 (zIndex 25)
    expect(initialCards[0].style.zIndex).toBe("30");
    expect(initialCards[1].style.zIndex).toBe("25");

    // Click stage to initiate 3D swinging flip
    act(() => {
      stage.click();
    });

    // In-flight state: Card 0 is flipping forward (zIndex 40), Card 1 shifts ahead (zIndex 30)
    expect(initialCards[0].style.zIndex).toBe("40");
    expect(initialCards[1].style.zIndex).toBe("30");

    // Wait for the 650ms flip timer to complete
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 750));
    });

    // Post-timer state: activeIndex advanced from 0 to 1
    // Card 1 is now front card at slot 0 (zIndex 30), Card 0 is moved to back (zIndex 10)
    expect(initialCards[1].style.zIndex).toBe("30");
    expect(initialCards[0].style.zIndex).toBe("10");
    expect(container.innerHTML).not.toContain("NaN");

    unmount();
  });
});

describe("DiagonalCardStack Runtime", () => {
  test("default input renders neutral CSS placeholders without <img>", () => {
    const { container, unmount } = renderToDom(<DiagonalCardStack autoPlay={false} />);
    const imgs = container.querySelectorAll("img");
    expect(imgs.length).toBe(0);
    expect(container.textContent).toContain("Stack 01");
    expect(container.textContent).toContain("Stack 10");
    expect(container.innerHTML).not.toContain("NaN");
    unmount();
  });

  test("null cards prop gracefully falls back to default neutral placeholders", () => {
    const { container, unmount } = renderToDom(<DiagonalCardStack cards={null} autoPlay={false} />);
    const imgs = container.querySelectorAll("img");
    expect(imgs.length).toBe(0);
    expect(container.textContent).toContain("Stack 01");
    expect(container.textContent).toContain("Stack 10");
    expect(container.innerHTML).not.toContain("NaN");
    unmount();
  });

  test("custom cards with image renders valid <img> elements", () => {
    const customCards = [
      { id: "d1", image: "/stacks/d1.png", title: "Diag 1" },
      { id: "d2", image: "/stacks/d2.png", title: "Diag 2" },
    ];
    const { container, unmount } = renderToDom(<DiagonalCardStack cards={customCards} autoPlay={false} />);
    const imgs = container.querySelectorAll("img");
    expect(imgs.length).toBe(2);
    expect(imgs[0].getAttribute("src")).toBe("/stacks/d1.png");
    expect(imgs[0].getAttribute("alt")).toBe("Diag 1");
    unmount();
  });

  test("edge cases: empty array, single card, and isStacked mode", () => {
    // Empty array
    const { container: emptyContainer, unmount: unmountEmpty } = renderToDom(
      <DiagonalCardStack cards={[]} autoPlay={false} />
    );
    expect(emptyContainer.querySelectorAll("img").length).toBe(0);
    expect(emptyContainer.innerHTML).not.toContain("NaN");
    unmountEmpty();

    // Single item
    const { container: singleContainer, unmount: unmountSingle } = renderToDom(
      <DiagonalCardStack cards={[{ id: "d-solo", title: "Solo Stack" }]} autoPlay={false} />
    );
    expect(singleContainer.querySelectorAll("img").length).toBe(0);
    expect(singleContainer.textContent).toContain("Solo Stack");
    expect(singleContainer.innerHTML).not.toContain("NaN");
    unmountSingle();

    // isStacked mode: verifies stacking order formula (zIndex = idx + 10)
    const { container: stackedContainer, unmount: unmountStacked } = renderToDom(
      <DiagonalCardStack isStacked={true} autoPlay={false} />
    );
    const cardNodes = stackedContainer.querySelectorAll(".pointer-events-auto");
    expect(cardNodes.length).toBe(10);
    expect(cardNodes[0].style.zIndex).toBe("10"); // idx 0 -> zIndex 10
    expect(cardNodes[9].style.zIndex).toBe("19"); // idx 9 -> zIndex 19
    expect(stackedContainer.textContent).toContain("Stack 01");
    expect(stackedContainer.innerHTML).not.toContain("NaN");
    unmountStacked();
  });

  test("interaction: click card triggers onCardClick callback with card and index", () => {
    let clickedData = null;
    let clickedIndex = null;
    const { container, unmount } = renderToDom(
      <DiagonalCardStack
        autoPlay={false}
        onCardClick={(card, idx) => {
          clickedData = card;
          clickedIndex = idx;
        }}
      />
    );
    const clickableCards = container.querySelectorAll(".pointer-events-auto");
    expect(clickableCards.length).toBe(10);

    // Click Card 0
    act(() => {
      clickableCards[0].click();
    });
    expect(clickedData).not.toBeNull();
    expect(clickedData.title).toBe("Stack 01");
    expect(clickedIndex).toBe(0);

    // Click Card 3
    act(() => {
      clickableCards[3].click();
    });
    expect(clickedData.title).toBe("Stack 04");
    expect(clickedIndex).toBe(3);

    unmount();
  });
});

import { assert, highlight, Key, keyboard, Location, mouse, movement, screen } from "./index";

const openXfceMenu = async () => {
  const menu = await screen.find("menu.png");
  await highlight(menu);
  await mouse.move(await movement.straightTo(Location.centerOf(menu)));
  await mouse.leftClick();
  await mouse.leftClick();
};

const run = async (cmd: string) => {
  await keyboard.type(Key.LeftAlt, Key.F2);
  await keyboard.type(cmd);
  await keyboard.type(Key.Enter);
};

const calculate = async () => {
  const plus = await screen.find("plus.png");
  await highlight(plus);
  await mouse.move(await movement.straightTo(Location.centerOf(plus)));
  await mouse.leftClick();
  const one = await screen.find("one.png");
  await highlight(one);
  await mouse.move(await movement.straightTo(Location.centerOf(one)));
  await mouse.leftClick();
  const zero = await screen.find("zero.png");
  await highlight(zero);
  await mouse.move(await movement.straightTo(Location.centerOf(zero)));
  await mouse.leftClick();
  await mouse.leftClick();
  await keyboard.type(Key.Enter);
};

const close = async () => {
  const x = await screen.find("close.png");
  await highlight(x);
  await mouse.move(await movement.straightTo(Location.centerOf(x)));
  await mouse.leftClick();
};

describe("E2E demo", () => {
  it("should run without throwing", async () => {
    jest.setTimeout(30000);
    screen.config.resourceDirectory = "./e2e/assets";
    await assert.isVisible("mouse.png");
    await assert.isVisible("desktop.png");
    await openXfceMenu();
    await run("gnome-calculator");
    await assert.isVisible("calculator.png");
    await keyboard.type("525");
    await calculate();
    await assert.isVisible("result.png");
    await close();
  });
});

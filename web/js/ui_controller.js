const UI = {

    scaleSlider: null,

    setup: () => {
        UI.scaleSlider = createSlider(50, 500, 100);
    },

    update: () => {
        renderer.scl = round(UI.scaleSlider.value() / 100, 1);
    }

}
const ripplesContent = {
  backgroundImage: "pool-background.png",
};

window.MONGLEDUM_RIPPLES_CUSTOMIZER = {
  backgroundImage: ripplesContent.backgroundImage,
};

export default function DummyPage() {
  return (
    <div id="ripples3">
      <span id="fps" hidden aria-hidden="true">
        -- --
      </span>
    </div>
  );
}

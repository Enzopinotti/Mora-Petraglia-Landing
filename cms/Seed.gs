function seedMoraCmsData() {

  var content =
    seedMoraContent_();


  var settings =
    seedMoraSettings_();


  Logger.log(
    JSON.stringify(
      {
        content: content,
        settings: settings,
      },
      null,
      2
    )
  );


  return {
    content: content,
    settings: settings,
  };
}
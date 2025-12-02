// adjust path as needed — the CSV file must be served (e.g. via a web server)
fetch("PRTCG - FractalSpectrum.csv")
  .then(res => {
    if (!res.ok) throw new Error("Network response was not ok");
    return res.text();
  })
  .then(text => {
    return csv().fromString(text);
  })
  .then(jsonArray => {
    // jsonArray is an array of objects, each object corresponds to a CSV row with columns as keys
    console.log(jsonArray);
    // e.g. you can do:
    document.body.innerText = JSON.stringify(jsonArray, null, 2);
  })
  .catch(error => {
    console.error("Error loading or parsing CSV:", error);
  });

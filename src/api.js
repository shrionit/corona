export default function API() {
  return {
    getAllCountries() {
      return (async () => {
        const res = await fetch("https://restcountries.eu/rest/v2/all");
        return await res.json();
      })();
    },
  };
}

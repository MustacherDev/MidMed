const NAME = Object.freeze(new Enum(
    "ALICE",
    "ANAJU",
    "ANDRE",
    "ARTHUR",
    "BERNAD",
    "BRUNA",
    "CAIO",
    "DANILO",
    "EUDA",
    "FGOIS",
    "FBARRETO",
    "FSANCHEZ",
    "HENRIQUE",
    "JP",
    "JOATAN",
    "ISABELLA",
    "MAYANNE",
    "MARCELO",
    "MATHEUS",
    "IKARO",
    "JVPORTO",
    "JVROCHA",
    "JONATAS",
    "ISRAEL",
    "MARIALUISA",
    "MARIANNA",
    "INGRID",
    "JOAS",
    "PAULA",
    "RAFAEL",
    "THALIA",
    "VICTORIA",
    "WILLISTON",
    "JUAN",
    "LAIS",
    "LILIAN",
    "LUIS",
    "MELINA",
    "MICCHAEL",
    "MILENA",
    "NILTON",
    "SAMUEL",
    "ARAUJO",
    "NATHALIA",
    "GABRIEL",
    "DENISE",
    "ELISIANY",
    "MARLUS",
    "BRUNELY",
    "SHEILA",
    "TOTAL"
));


class Person{
  constructor(name, altName, extraName, bday){
    this.name = name;
    this.altName = altName;
    this.extraName = extraName;
    this.bdat = bdat;
  }
}




function NameManager(){
  this.names = [
    ["ALICE", "ALICE"],
    ["ANA JULIA", "ANA JULIA"],
    ["ANDRE", "ANDREW"],
    ["ARTHUR", "ARTHUR"],
    ["BERNAD", "HIBERNA"],
    ["BRUNA", "BRUNA"],
    ["CAIO", "FALL"],
    ["DANILO", "DAN"],
    ["EUDA","EUDA"],
    ["FELIPE GOIS", "PHILLIP GOES"],
    ["BARRETO","BARRET"],
    ["SANCHEZ","SANCHEZ"],
    ["HENRIQUE","HENRY"],
    ["JOAO PAULO","JOHN PAUL"],
    ["JOATAN","JOATAN"],
    ["ISABELLA","ISABELL"],
    ["MAYANNE","MAY ANNE"],
    ["MARCELO","MARSHALL"],
    ["MATHEUS","MATTHEW"],
    ["IKARO","ICARUS"],
    ["JV PORTO","JV HARBOR"],
    ["JV ROCHA","JV ROCK"],
    ["JONATAS","JONATHAN"],
    ["ISRAEL","ISRAEL"],
    ["MARIA LUISA","MARY LOUISE"],
    ["MARIANNA","MARY ANNE"],
    ["INGRID","HINGRID"],
    ["JOAS","JOSHUA"],
    ["PAULA","PAULINE"],
    ["DANTAS","DONATELO"],
    ["THALIA","ITALIA"],
    ["VICTORIA","VICTORY"],
    ["WILLISTON","NOT SILLIW"],
    ["JUAN","JUAN"],
    ["LAIS","LAYS"],
    ["LILIAN","LILIAN"],
    ["LUIS","LOUIS"],
    ["MELINA","HONEY-INA"],
    ["MICCHAEL","JACKSON"],
    ["MILENA","THOUSAND-ENA"],
    ["NILTON","NEWTON"],
    ["SAMUEL","SAM"],
    ["ARAUJO","MICKELANGELO"],
    ["NATHALIA","NATALINA"],
    ["GABRIEL","GABRIEL"],
    ["DENISE","DENISE"],
    ["ELISIANY","ELISIANY"],
    ["MARLUS","MARCUS"],
    ["BRUNELY","BRUNELY"],
    ["SHEILA", "SHEILA"],
  ];

  // this.persons = [
  //   new Person("ALICE", "ALL ICE", "NO PAÍS", "2024-0"),
  //
  // ];
}

var nameMan = new NameManager();

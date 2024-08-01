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
    "DIOGO",
    "SIDNEY",
    "TOTAL"
));


class Person{
  constructor(name, altName, extraNames, bday, bmonth){
    this.name = name;
    this.altName = altName;
    this.extraNames = extraNames;
    this.bday = bday;
    this.bmonth = bmonth;
  }
}


class CodenamesHint{
  constructor(hint, probUnits){
    this.hint = hint;
    this.probUnits = probUnits;
  }
}

class CodenamesProbUnit{
  constructor(nameList, prob){
    this.nameList   = nameList;
    this.prob = prob;
  }
}



class NameManager{
  constructor(){

    this.persons = [
      new Person("ALICE", "ALL ICE", ["NO PAÍS"], 16, 11),
      new Person("ANA JULIA", "JULY ANNE", ["JULIANA"], 13, 11),
      new Person("ANDRE", "ANDREW", ["AND"],  9, 8),
      new Person("ARTHUR", "ARTHUR", ["ART"], 6, 7),
      new Person("BERNAD", "HIBERNAR", ["BERNARDO"], 7, 12),
      new Person("BRUNA", "BRUNA",["BR"],9,4),
      new Person("CAIO", "FALL", ["CAIO"], 16, 4),
      new Person("DANILO", "DAN", ["DANIEL"], 19, 6),
      new Person("EUDA","EUDA", ["EUDA"], 19, 8),
      new Person("FELIPE GOIS", "PHILLIP GOES", ["EUDA"], 9, 11),
      new Person("BARRETO","BARRET", ["EUDA"], 2, 6),
      new Person("SANCHEZ","SANCHEZ", ["EUDA"], 21, 5),
      new Person("HENRIQUE","HENRY", ["EUDA"], 25, 1),
      new Person("JOAO PAULO","JOHN PAUL", ["EUDA"], 10, 12),
      new Person("JOATAN","JOATAN", ["EUDA"], 29, 10),
      new Person("ISABELLA","ISABELL", ["EUDA"], 26, 10),
      new Person("MAYANNE","MAY ANNE", ["EUDA"], 8, 2),
      new Person("MARCELO","MARSHALL", ["EUDA"], 22, 3),
      new Person("MATHEUS","MATTHEW", ["EUDA"], 7, 3),
      new Person("IKARO","ICARUS", ["EUDA"], 7, 11),
      new Person("JV PORTO","JV HARBOR", ["EUDA"], 4, 11),
      new Person("JV ROCHA","JV ROCK", ["EUDA"], 30, 6),
      new Person("JONATAS","JONATHAN", ["EUDA"], 1, 6),
      new Person("ISRAEL","ISRAEL", ["EUDA"], 5, 6),
      new Person("MARIA LUISA","MARY LOUISE", ["EUDA"], 12, 6),
      new Person("MARIANNA","MARY ANNE", ["EUDA"], 7, 8),
      new Person("INGRID","HINGRID", ["EUDA"], 26, 9),
      new Person("JOAS","JOSHUA", ["EUDA"], 22, 5),
      new Person("PAULA","PAULINE", ["EUDA"], 12, 3),
      new Person("DANTAS","DONATELO", ["EUDA"], 1, 10),
      new Person("THALIA","ITALIA", ["EUDA"], 23, 8),
      new Person("VICTORIA","VICTORY", ["EUDA"], 5, 11),
      new Person("WILLISTON","NOT SILLIW", ["EUDA"], 8, 1),
      new Person("JUAN","JUAN", ["EUDA"], 10, 12),
      new Person("LAIS","LAYS", ["EUDA"], 19, 4),
      new Person("LILIAN","LILIAN", ["EUDA"], 14, 9),
      new Person("LUIS","LOUIS", ["EUDA"], 14, 8),
      new Person("MELINA","HONEY-INA", ["EUDA"], 23, 2),
      new Person("MICCHAEL","JACKSON", ["EUDA"], 20, 9),
      new Person("MILENA","THOUSAND-ENA", ["EUDA"], 25, 7),
      new Person("NILTON","NEWTON", ["EUDA"], 24, 3),
      new Person("SAMUEL","SAM", ["EUDA"], 23, 12),
      new Person("ARAUJO","MICKELANGELO", ["EUDA"], 26, 2),
      new Person("NATHALIA","NATALINA", ["EUDA"], 12, 5),
      new Person("GABRIEL","GABRIEL", ["EUDA"], 30, 12),
      new Person("DENISE","DENISE", ["EUDA"], 0, 13),
      new Person("ELISIANY","ELISIANY", ["EUDA"], 28, 8),
      new Person("MARLUS","MARCUS", ["EUDA"], 9, 12),
      new Person("BRUNELY","BRUNELY", ["EUDA"], 1, 2),
      new Person("SHEILA", "SHEILA", ["SHEILA"], 4, 1),
      new Person("DIOGO","DIOGO", ["DIOGO"], 24, 1),
      new Person("SIDNEY", "KIDNEY", ["SID"], 19, 1),
    ];


    this.orderPattern = [
      [
         0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
        10,11,12,13,14,15,16,17,18,19,
        20,21,22,23,24,25,26,27,28,29,
        30,31,32,33,34,35,36,37,38,39,
        40,41,42,43,44,45,46,47,48,49
      ],
      [
         0,21, 1,15,40,47, 7,43,30,49,
         2,36,44,27,41,12,29,11,18, 4,
         6,34,26,13,35, 8,23,46,37,16,
        48,19, 3,31,25,17,28, 9,22,39,
        42,38, 5,33,24,10,32,20,14,45
      ],
      [
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
        10,11,12,13,14,15,16,17,18,19,
        20,21,22,23,24,25,26,27,28,29,
        30,31,32,33,34,35,36,37,38,39,
        40,41,42,43,44,45,46,47,48,49
      ],
      [
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
        10,11,12,13,14,15,16,17,18,19,
        20,21,22,23,24,25,26,27,28,29,
        30,31,32,33,34,35,36,37,38,39,
        40,41,42,43,44,45,46,47,48,49
      ]

    ];

    this.sortList


    this.hint = function(name, probNameList){
      var fixedList = [];

      for(var i = 0; i < probNameList.length; i++){
        var prob = 1;
        if(probNameList[i].length == 2){
          prob = probNameList[i][1];
        }

        for(var j = 0 ; j < probNameList[i][0].length; j++){
          var nameList = [];
          nameList.push(probNameList[i][0][j]);

          var probUnit = new CodenamesProbUnit(nameList, prob);
          fixedList.push(probUnit);
        }


      }

      fixedList.sort(function (a, b) { return b.prob - a.prob});

      return new CodenamesHint(name, fixedList);
    }

    this.codenamesHints = [
      this.hint("050", [[[NAME.JOAS,NAME.HENRIQUE,NAME.SAMUEL], 1], [[NAME.MARLUS], 0.75], [[NAME.ELISIANY], 0.5], [[NAME.GABRIEL], 0.2]]),
      this.hint("MULHER", [[[NAME.ALICE,NAME.ANAJU,NAME.BRUNA,NAME.EUDA, 
        NAME.ISABELLA, NAME.MAYANNE, NAME.MARIALUISA, NAME.MARIANNA, NAME.INGRID,
        NAME.PAULA, NAME.THALIA, NAME.VICTORIA, NAME.LAIS, NAME.LILIAN, NAME.MELINA,
        NAME.MILENA, NAME.NATHALIA, NAME.DENISE, NAME.ELISIANY, NAME.BRUNELY, NAME.SHEILA], 1]]),
      this.hint("ESPIRITO SANTO", [[[NAME.ANDRE, NAME.LUIS, NAME.MAYANNE], 1]]),
      this.hint("ALTURA", [[[NAME.LUIS,NAME.JOATAN,NAME.JOAS,NAME.JVPORTO],1], [[NAME.NILTON,NAME.FGOIS], 0.7], [[NAME.IKARO,NAME.BERNAD], 0.8]]),
      this.hint("XADREZ", [[[NAME.RAFAEL,NAME.MICCHAEL],1], [[NAME.SIDNEY], 0.9] , [[NAME.HENRIQUE,NAME.JOAS, NAME.JVPORTO], 0.7], [[NAME.FBARRETO], 0.5]]),
      this.hint("AGE OF EMPIRES", [[[NAME.ARAUJO, NAME.RAFAEL, NAME.SAMUEL, NAME.ANDRE, NAME.MICCHAEL],1], [[NAME.JOAS,NAME.HENRIQUE], 0.7]]),
      this.hint("CODENAMES", [[[NAME.ARAUJO,NAME.MICCHAEL,NAME.RAFAEL,NAME.FSANCHEZ,NAME.JOAS,NAME.HENRIQUE,NAME.ANDRE],1], [[NAME.FBARRETO,NAME.GABRIEL], 0.5], [[NAME.NATHALIA], 0.1]]),
      this.hint("TERMOOO", [[[NAME.SIDNEY,NAME.NATHALIA,NAME.ANAJU],1], [[NAME.HENRIQUE,NAME.ARAUJO], 0.9], [[NAME.MARCELO], 0.8], [[NAME.RAFAEL], 0.7], [[NAME.FGOIS], 0.6]])
    ];
  }
}

var nameMan = new NameManager();

Käytin projektin tekemiseen ChatGPT:tä (GPT-5.2 ja välillä GPT-5-mini).

1. Mitä tekoäly teki hyvin?

Tekoälyn kanssa koodaaminen tuntuu hieman kuin olisi ohjaajana, jonka tehtävä on suunnitella, kuinka ohjelman kuuluu toimia, sovittaa tekoälyn tekemät koodinpätkät yhteen ja tarkistaa, että kaikki toimii hyvin. Koodaaminen ja ideoiden iterointi on todella nopeaa, koska tekoäly tekee boilerplate-koodin todella nopeasti, eikä syntaksia tarvitse miettiä paljon.

Tekoäly sai jo yhdessä vastauksessa tehtyä toimivan, yksinkertaistetun version, jota voin sitten lähteä kehittämään edelleen. Siitä oli myös apua debuggauksessa ja se tajusi muutaman bugin syyn lyhyen kuvauksen perusteella ja korjasi ne helposti. Lisäksi sillä on loputtomasti kärsivällisyyttä "hölmöille kysymyksille", mikä kannustaa kysymään ja oppimaan.

ChatGPT tietää custom instructions ja vanhojen keskustelujen takia, että olen opettanut itselleni koodaamista ja haen töitä. Se selitti koodia aika hyvin auki ja alkoi antaa työhaastatteluvinkkejä - aika hauskaa.

2. Mitä tekoäly teki huonosti?

Tekoäly ei mieti käyttäjän kokemusta ja tarpeita (ellei sitä erikseen pyydä miettimään niitä), joten ihmisen täytyy suunnitella oman kokemuksensa pohjalta, mitä ominaisuuksia ohjelmaan kannattaa lisätä. Tästä esimerkkejä myöhemmin. Jos seuraisi tekoälyn ehdotuksia sokeasti, voisi eksyä hiomaan yksityiskohtia, joita ei ehkä vielä tarvita tässä vaiheessa.

Aluksi koodissa lähes kaikki on tuupattu samaan tiedostoon, mikä ei ole "the React way", mutta se on ymmärrettävää, koska ensimmäinen versio on luonnos.

3. Mitkä olivat tärkeimmät parannukset, jotka teit tekoälyn tuottamaan koodiin ja miksi?

Mietin, millaisia oikeasti käyttämäni käyttäjäystävälliset ajanvaraussovellukset ovat olleet ja yritin tehdä ohjelmasta samanlaisen, esim. lisäsin visuaalisen kalenterin ja tein pidempien aikojen varaamisesta intuitiivista klikkaamalla time slotteja dropdown menusta valitsemisen sijaan.

Tekoäly ei ottanut huomioon varausten validointia ennen kuin ehdotin sitä. Lisäksi varausten perumisessa oli aluksi ongelma, jonka takia käyttäjät olisivat voineet perua muiden varauksia, joten korjasin sen. Nämä seikat olivat tärkeitä, jotta ohjelma toimisi ennalta-arvattavasti ja turvallisesti.

Tein koodista luettavampaa ja helpommin muokattavaa siirtämällä pieniä kokonaisuuksia pois App.tsx:stä esim. kansioihin components, services, styles, utils. Korvasin CSS inline stylet selkeämmällä Tailwind CSS:llä. Ja backendiin tein esim. models, services, storage, helpers -tiedostot, jotta koodi olisi selkeämpää.
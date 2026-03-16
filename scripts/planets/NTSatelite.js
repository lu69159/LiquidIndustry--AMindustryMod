const NT = require("planets/Nepture").NT;

const NTsatellite = new Planet("冰卫一", NT, 0.4, 1);
NTsatellite.localizedName = "冰卫一";
NTsatellite.meshLoader = prov(() => new MultiMesh(
	new HexMesh(NTsatellite, 2),
	new HexSkyMesh(NTsatellite, 3, 0.15, 0.02, 2, Color.valueOf("C0ECFF"), 2, 0.42, 1, 0.43),
));
NTsatellite.generator = extend(TantrosPlanetGenerator, {
    getColor(position ,out){
        out.set(Color.valueOf("C0ECFF"));
    }
});
NTsatellite.accessible = false;
NTsatellite.bloom = false;
NTsatellite.hasAtmosphere = false;
NTsatellite.orbitRadius = 10;
NTsatellite.orbitTime = 60 * 60;
exports.NTsatellite = NTsatellite;

const dayjs = require("dayjs");
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

const TAF_DEST = "TAF UBBN 201649Z 2018/2118 VRB04KT 8000 SCT050 BKN100 TX09/2112Z TNM05/2103Z TEMPO 2002/2102 04010KT 2000 TEMPO 2102/2107 01010KT 3000 BR BCFG FEW035CB BKN080 BECMG 2001/2109 22008KT 6000 NSW FM200100 27006MPS 6000 BKN016";
const ETA = "2024-12-20T01:20:00.000Z" //2001


const checkVisibilityWarning = (taf, arrivalTime, flight) => {
    const date = new Date(arrivalTime);
    const day = String(date.getUTCDate()).padStart(2, '0'); // Get day and ensure 2 digits
    let hour = String(date.getHours()).padStart(2, '0'); // Get hour and ensure 2 digits
    const arrTime = parseInt(day + hour); // Join day and hour as a string

    const parseTAF = (taf) => {
        // Split TAF into meaningful sections by keywords (TEMPO, BECMG, FM, etc.)
        const regex = /(TEMPO|BECMG|FM\d{6})/g;
        const tafSections = taf?.split(regex).reduce((acc, item, index, arr) => {
            if (regex.test(item)) {
                acc.push({ keyword: item, content: arr[index + 1]?.trim() || '' });
            }
            return acc;
        }, []);
        return tafSections
    };

    const tafParts = parseTAF(taf)


    const coveringDateTafParts = () => {
        const res = [] //2109
        tafParts?.forEach((item) => {
            if (item.keyword === 'TEMPO' || item.keyword === 'BECMG') {
                const datePart = item?.content?.split(" ").find(item => item.includes("/"))
                const startTime = parseInt(datePart?.split("/")[0])
                const endTime = parseInt(datePart?.split("/")[1])


                if (startTime <= arrTime) {
                    if (endTime < arrTime) {
                        if (Math.abs(arrTime - endTime) < 2) {
                            res.push(item)
                        }
                    } else {
                        res.push(item)
                    }
                } else {
                    if (Math.abs(startTime - arrTime) < 2) {
                        res.push(item)
                    }
                }
            } else if (item.keyword.includes("FM")) {
                const startTime = parseInt(item.keyword.substring(2, 6))

                if (arrTime >= startTime) {
                    res.push(item)
                }
            }
        })
        return res
    };

    const coveringTafParts = coveringDateTafParts()

    const isBadVisibility = () => {
        const tafsWithBadVis = coveringTafParts.filter(item => item?.content?.split(" ").some(item => {
            return !isNaN(item) && parseInt(item) < 1000
        }))

        return tafsWithBadVis.length > 0
    };

    const isWarning = isBadVisibility()
    return isWarning;
};


module.exports = { checkVisibilityWarning }
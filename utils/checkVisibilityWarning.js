const dayjs = require("dayjs");
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

const TAF_DEST = "TAF UBBN 201649Z 2018/2118 VRB04KT 8000 SCT050 BKN100 TX09/2112Z TNM05/2103Z TEMPO 2002/2102 04010KT 2000 TEMPO 2102/2107 01010KT 3000 BR BCFG FEW035CB BKN080 BECMG 2001/2109 22008KT 6000 NSW FM200100 27006MPS 6000 BKN016";
const ETA = "2024-12-20T01:20:00.000Z" //2001


const checkVisibilityWarning = (taf, arrivalTime, departureTime, item) => {

    const date = new Date(arrivalTime);
    let day = String(date.getDate()).padStart(2, '0'); // Get day and ensure 2 digits

    let hour = String(date.getHours()).padStart(2, '0'); // Get hour and ensure 2 digits

    const depDate = new Date(departureTime);
    let depHour = String(depDate.getHours()).padStart(2, '0');

    if (hour < depHour) {
        day = String(parseInt(day) + 1)
    }

    const arrTime = parseInt(day + hour); // Join day and hour as a string


    const parseTAF = (taf) => {
        // Split TAF into meaningful sections by keywords (TEMPO, BECMG, FM, etc.)
        const regex = /(TEMPO|TAF|PROB30|PROB40|BECMG|FM\d{6})/g;
        const tafSections = taf?.split(regex).reduce((acc, item, index, arr) => {
            if (regex.test(item)) {
                acc.push({ keyword: item, content: arr[index + 1]?.trim() || '' });
            }
            return acc;
        }, []);
        return tafSections
    };

    // if (flight?.flight_number === 68) {
    //     taf = "TAF UBBB 022257Z 0300/0324 VRB04KT 1500 BR BCFG BKN004 TX12/0310Z TN01/0301Z TEMPO 0300/0305 30005KT 0500 FG BKN002 BECMG 0305/0307 09005KT 9999 NSW SCT025 TEMPO 0307/0314 VRB04KT BECMG 0316/0318 18005KT TEMPO 0318/0324 VRB04KT SCT006"
    // }
    const tafParts = parseTAF(taf)
    // Function to check if a given arrival time falls within a TAF period
    const coveringDateTafParts = () => {
        const res = [];

        tafParts?.forEach((item) => {
            if (["TEMPO", "BECMG", "PROB30", "PROB40", "TAF"].includes(item.keyword)) {

                const datePart = item?.content?.split(" ").find(part => part.includes("/"));
                if (!datePart) return;

                const [startStr, endStr] = datePart.split("/");

                const startTime = parseInt(startStr);
                const endTime = parseInt(endStr);

                if (Math.abs(startTime - arrTime) < 2 ||
                    (startTime <= arrTime && (endTime >= arrTime || Math.abs(arrTime - endTime) < 2))) {
                    res.push(item);
                }
            }
            else if (item.keyword.includes("FM")) {
                const startTime = parseInt(item.keyword.substring(2, 6));
                if (arrTime >= startTime) {
                    res.push(item);
                }
            }
        });

        return res;
    };


    const coveringTafParts = coveringDateTafParts()

    const isBadVisibility = () => {
        const tafsWithBadVis = coveringTafParts.filter(item => item?.content?.split(" ").some(item => {
            return !isNaN(item) && parseInt(item) <= 1500
        }))

        return tafsWithBadVis.length > 0
    };

    const isWarning = isBadVisibility()
    return isWarning;
};


module.exports = { checkVisibilityWarning }
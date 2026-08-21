"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
var rawData = "\n| 01/08/2026 | Dana Masuk dari BENEDICT SAVIOLA PRADANA | BCA - - | Rp 500.000 | Pemasukan | Rp 503.643 |\n| 01/08/2026 | Transfer ke COKORDA GDE RADITYA WIRA | BCA | 1785566047783793 | -Rp 208.272 | Pengeluaran | Rp 295.371 |\n| 01/08/2026 | Transfer ke MARIA DELA VIONA | BANK NEGARA INDONESIA (BNI) | 1785567520971165 | -Rp 30.000 | Pengeluaran | Rp 265.371 |\n| 01/08/2026 | Pembayaran QRIS | IOH OP1D01285277 | pakfpat0018078639776 | -Rp 80.000 | Pengeluaran | Rp 185.371 |\n| 02/08/2026 | Autodebit bluSaving | bluSaving tabungan | -Rp 100.000 | Pengeluaran | Rp 85.371 |\n| 02/08/2026 | Pembayaran QRIS | WARUNG SAMSAM BUK EKA ID1026004715607 | 0594049956xxr5y36578 | -Rp 25.000 | Pengeluaran | Rp 60.371 |\n| 02/08/2026 | Pembayaran QRIS | INDOMARET 000125583 | 17856813178200000802 | -Rp 14.500 | Pengeluaran | Rp 45.871 |\n| 03/08/2026 | Pembayaran QRIS | WARUNG SAMSAM BUK EKA ID1026004715607 | 0594246406yqp8g91825 | -Rp 20.000 | Pengeluaran | Rp 25.871 |\n| 03/08/2026 | Pembayaran QRIS | Mbok Siti, KALIPURO G495774700 | q3u5OiUZhUz20a151761 | -Rp 17.000 | Pengeluaran | Rp 8.871 |\n| 04/08/2026 | Pembayaran QRIS | KEDAI CIREMAI 003, DEPOK G647743036 | MYwepi6gySzpvdo24632 | -Rp 7.000 | Pengeluaran | Rp 1.871 |\n| 04/08/2026 | Dana Masuk dari BENEDICT SAVIOLA PRADANA | BCA - - | Rp 700.000 | Pemasukan | Rp 701.871 |\n| 04/08/2026 | Pembayaran QRIS | Toko ratu bilqis 1 024121246 | 52c0c86b360c4fo03412 | -Rp 20.000 | Pengeluaran | Rp 681.871 |\n| 04/08/2026 | Pembayaran QRIS | Tekosu coffee 72155325046 | 65339925260cpf843288 | -Rp 23.000 | Pengeluaran | Rp 658.871 |\n| 04/08/2026 | Pembayaran QRIS | Tekosu coffee 72155325046 | 39025829560g5g615815 | -Rp 16.000 | Pengeluaran | Rp 642.871 |\n| 04/08/2026 | Pembayaran QRIS | KEDAI CIREMAI 003, DEPOK G647743036 | GcgdhpMktJ0jygq26522 | -Rp 7.000 | Pengeluaran | Rp 635.871 |\n| 05/08/2026 | Pembayaran QRIS | Mie Ayam Bakso Tetelan Pa G070312953 | Nz8KA3OL2U14wic11290 | -Rp 23.000 | Pengeluaran | Rp 612.871 |\n| 05/08/2026 | Pembayaran QRIS | MOKAPOS.COM G519742204 | qTs4jlIuVE15ahz65202 | -Rp 26.250 | Pengeluaran | Rp 586.621 |\n| 05/08/2026 | Pembayaran QRIS | Barberking Indonesia 809086938 | 0ee4b56f2519biq28111 | -Rp 20.140 | Pengeluaran | Rp 566.481 |\n| 05/08/2026 | Pembayaran QRIS | BARBERKING BK10 QR 617194583 | F2260DDKBT19fij49829 | -Rp 60.000 | Pengeluaran | Rp 506.481 |\n| 05/08/2026 | Pembayaran QRIS | CW Coffee Seturan Raya 000885004683567 | 02284865409288059253 | -Rp 17.000 | Pengeluaran | Rp 489.481 |\n| 05/08/2026 | Pembayaran QRIS | Pecel Lele Mbak Nur Babar G570540498 | oCDrsB2P9S1ivj891492 | -Rp 23.000 | Pengeluaran | Rp 466.481 |\n| 06/08/2026 | Pembayaran QRIS | KEDAI CIREMAI 003, DEPOK G647743036 | 0QISNsRZms26fli78157 | -Rp 15.000 | Pengeluaran | Rp 451.481 |\n| 06/08/2026 | Pembayaran QRIS | KEDAI CIREMAI 003, DEPOK G647743036 | qne70KepWt2demp18792 | -Rp 15.000 | Pengeluaran | Rp 436.481 |\n| 06/08/2026 | Pembayaran QRIS | KEDAI CIREMAI 003, DEPOK G647743036 | gUR5NSfqHD2rmod54579 | -Rp 18.000 | Pengeluaran | Rp 418.481 |\n| 07/08/2026 | Top Up E-Wallet | SHOPEEPAY 085737853822 | 17860805238440043335 | -Rp 22.000 | Pengeluaran | Rp 396.481 |\n| 07/08/2026 | Transfer ke FERNANDA JESSICA NATASYA | BCA | 1786080591626280 | -Rp 40.000 | Pengeluaran | Rp 356.481 |\n| 07/08/2026 | Top Up E-Wallet | SHOPEEPAY 085737853822 | 17861171120430043709 | -Rp 25.000 | Pengeluaran | Rp 331.481 |\n| 08/08/2026 | Pembayaran QRIS | KEDAI CIREMAI 003, DEPOK G647743036 | n92OPK4h0m4fq2w21553 | -Rp 15.000 | Pengeluaran | Rp 316.481 |\n| 08/08/2026 | Transfer ke BENEDICT SAVIOLA PRADANA | BCA | 1786174962477394 | -Rp 100.000 | Pengeluaran | Rp 216.481 |\n| 08/08/2026 | Pembayaran QRIS | KEDAI CIREMAI 003, DEPOK G647743036 | 7TFV2xoEN34ls2x92716 | -Rp 7.000 | Pengeluaran | Rp 209.481 |\n| 08/08/2026 | Top Up E-Wallet | SHOPEEPAY 085737853822 | 17861970648660043907 | -Rp 25.000 | Pengeluaran | Rp 184.481 |\n| 09/08/2026 | Autodebit bluSaving | bluSaving tabungan | -Rp 100.000 | Pengeluaran | Rp 84.481 |\n| 09/08/2026 | Pembayaran QRIS | KEDAI CIREMAI 003, DEPOK G647743036 | OS49wWTS2w5k57231729 | -Rp 16.000 | Pengeluaran | Rp 68.481 |\n| 09/08/2026 | Pembayaran QRIS | KEDAI CIREMAI 003, DEPOK G647743036 | mPkCDlB8Jm5vv8g36409 | -Rp 16.000 | Pengeluaran | Rp 52.481 |\n| 09/08/2026 | Top Up E-Wallet | SHOPEEPAY 085737853822 | 17862930632500043203 | -Rp 20.000 | Pengeluaran | Rp 32.481 |\n| 10/08/2026 | Pembayaran QRIS | KEDAI CIREMAI 003, DEPOK G647743036 | XBqV90jG726kyaq64219 | -Rp 15.000 | Pengeluaran | Rp 17.481 |\n| 10/08/2026 | Dana Masuk dari BENEDICT SAVIOLA PRADANA | BCA - - | Rp 730.000 | Pemasukan | Rp 747.481 |\n| 10/08/2026 | Pembayaran QRIS | KEDAI CIREMAI 003, DEPOK G647743036 | WDMXOmA7ZM6vtbn92011 | -Rp 15.000 | Pengeluaran | Rp 732.481 |\n| 10/08/2026 | Top Up E-Wallet | SHOPEEPAY 085737853822 | 17863663339520043667 | -Rp 25.000 | Pengeluaran | Rp 707.481 |\n| 11/08/2026 | Pembayaran QRIS | Boss Cumi Nologaten 20984985 | 4U1MILVR0D7q6em83442 | -Rp 11.000 | Pengeluaran | Rp 696.481 |\n| 11/08/2026 | Pembayaran QRIS | KEDAI CIREMAI 003, DEPOK G647743036 | OcHaW4KnRS7z4ga07203 | -Rp 18.000 | Pengeluaran | Rp 678.481 |\n| 11/08/2026 | Top Up E-Wallet | SHOPEEPAY 085737853822 | 17864595400590043129 | -Rp 25.000 | Pengeluaran | Rp 653.481 |\n| 12/08/2026 | Pembayaran QRIS | SPBU KASAM 4455219 71942911997 | 04894210558pyix29266 | -Rp 50.000 | Pengeluaran | Rp 603.481 |\n| 12/08/2026 | Pembayaran QRIS | RM SAHABAT BUNDO 000885002959987 | 04634546501343620505 | -Rp 15.000 | Pengeluaran | Rp 588.481 |\n| 12/08/2026 | Pembayaran QRIS | PT Tokopedia 59400 | 048300354797nkk47833 | -Rp 26.700 | Pengeluaran | Rp 561.781 |\n| 12/08/2026 | Pembayaran QRIS | KEDAI CIREMAI 003, DEPOK G647743036 | tTL58RT3IT98pl700295 | -Rp 15.000 | Pengeluaran | Rp 546.781 |\n| 13/08/2026 | Pembayaran QRIS | INDOMARET 000125583 | 17865833747050000976 | -Rp 7.000 | Pengeluaran | Rp 539.781 |\n| 13/08/2026 | Pembayaran QRIS | RM SAHABAT BUNDO 000885002959987 | 04967403207862580160 | -Rp 15.000 | Pengeluaran | Rp 524.781 |\n| 13/08/2026 | Pembayaran QRIS | KEDAI CIREMAI 003, DEPOK G647743036 | lgLQDq9smaaaro683550 | -Rp 15.000 | Pengeluaran | Rp 509.781 |\n| 13/08/2026 | Pembayaran QRIS | LAUNDRY ZONE_GOWOK 000885002816168 | 01088126559945286789 | -Rp 21.000 | Pengeluaran | Rp 488.781 |\n| 14/08/2026 | Pembayaran QRIS | KEDAI CIREMAI 003, DEPOK G647743036 | ELpGGSj4edb1hqj84439 | -Rp 15.000 | Pengeluaran | Rp 473.781 |\n| 14/08/2026 | Top Up E-Wallet | SHOPEEPAY 085737853822 | 17867002010010043412 | -Rp 25.000 | Pengeluaran | Rp 448.781 |\n| 15/08/2026 | Pembayaran QRIS | KEDAI CIREMAI 003, DEPOK G647743036 | RV2Y6XSfi0c4s2h87189 | -Rp 16.000 | Pengeluaran | Rp 432.781 |\n| 15/08/2026 | Pembayaran QRIS | KEDAI CIREMAI 003, DEPOK G647743036 | J4PGospz03ckg4k59650 | -Rp 17.000 | Pengeluaran | Rp 415.781 |\n| 15/08/2026 | Pembayaran QRIS | Tekosu coffee 72155325046 | 8792080514cls4r51036 | -Rp 23.000 | Pengeluaran | Rp 392.781 |\n| 16/08/2026 | Dana Masuk dari Richardo Mario Martin | BCA Digital | Rp 20.000 | Pemasukan | Rp 412.781 |\n| 16/08/2026 | Transfer ke Richardo Mario Martin | BCA Digital | 1786813900979314 | -Rp 86.100 | Pengeluaran | Rp 326.681 |\n| 16/08/2026 | Pembayaran QRIS | Lapak parkir simple 250109193 | 03ef951a6ecsq5t46874 | -Rp 3.000 | Pengeluaran | Rp 323.681 |\n| 16/08/2026 | Autodebit bluSaving | bluSaving tabungan | -Rp 100.000 | Pengeluaran | Rp 223.681 |\n| 16/08/2026 | Pembayaran QRIS | KEDAI CIREMAI 003, DEPOK G647743036 | OHbgBFWSygcty6c05057 | -Rp 7.000 | Pengeluaran | Rp 216.681 |\n| 16/08/2026 | Top Up E-Wallet | GOPAY 085737853822 | 17868579267240043151 | -Rp 35.000 | Pengeluaran | Rp 181.681 |\n| 16/08/2026 | Dana Masuk dari BENEDICT SAVIOLA PRADANA | BCA - - | Rp 607.000 | Pemasukan | Rp 788.681 |\n| 17/08/2026 | Pembayaran QRIS | KEDAI CIREMAI 003, DEPOK G647743036 | rX4a27qVNYei3b166592 | -Rp 19.000 | Pengeluaran | Rp 769.681 |\n| 17/08/2026 | Transfer ke BENEDICT SAVIOLA PRADANA | BCA | 1786951285825553 | -Rp 50.000 | Pengeluaran | Rp 719.681 |\n| 17/08/2026 | Transfer ke BENEDICT SAVIOLA PRADANA | BCA | 1786951524805209 | -Rp 10.000 | Pengeluaran | Rp 709.681 |\n| 17/08/2026 | Pembayaran QRIS | INDOMARET 000125583 | 17869607031940000122 | -Rp 13.800 | Pengeluaran | Rp 695.881 |\n| 17/08/2026 | Top Up E-Wallet | SHOPEEPAY 085737853822 | 17869721523620043526 | -Rp 22.000 | Pengeluaran | Rp 673.881 |\n| 18/08/2026 | Pembayaran QRIS | SPBU KASAM 4455219 71942911997 | 6965102832fegeh19067 | -Rp 50.000 | Pengeluaran | Rp 623.881 |\n| 18/08/2026 | Pembayaran QRIS | Cilok rizki 000013000 | 64ca907f27ffidv99737 | -Rp 10.000 | Pengeluaran | Rp 613.881 |\n| 18/08/2026 | Pembelian PLN Prabayar | ELISABETH MURTI S S 5 - 521090318180 | 17870575423960043241 | -Rp 50.000 | Pengeluaran | Rp 563.881 |\n| 18/08/2026 | Biaya Admin PLN | ELISABETH MURTI S S 5 - 521090318180 | 17870575423960043241 | -Rp 2.750 | Pengeluaran | Rp 561.131 |\n| 18/08/2026 | Pembayaran QRIS | KEDAI CIREMAI 003, DEPOK G647743036 | PwjnU3caPLfy4ga47196 | -Rp 11.000 | Pengeluaran | Rp 550.131 |\n| 18/08/2026 | Transfer ke MARIA ROSARIE DINARA VIA | BCA | 1787063208226458 | -Rp 100.000 | Pengeluaran | Rp 450.131 |\n| 18/08/2026 | Dana Masuk dari bluSaving | bluSaving din | Rp 100.000 | Pemasukan | Rp 550.131 |\n| 19/08/2026 | Pembayaran QRIS | INDOMARET 000125583 | 17871042196780000746 | -Rp 17.500 | Pengeluaran | Rp 532.631 |\n| 19/08/2026 | Pembayaran QRIS | GEPREKIN BESI JANGKANG 26061700000458 | 5L8ZK4D137goli961002 | -Rp 14.000 | Pengeluaran | Rp 518.631 |\n| 19/08/2026 | Pembayaran QRIS | KEDAI CIREMAI 003, DEPOK G647743036 | W7hS8CxKK8gykjf30519 | -Rp 17.000 | Pengeluaran | Rp 501.631 |\n| 20/08/2026 | Pembayaran QRIS | KEDAI CIREMAI 003, DEPOK G647743036 | sNVN4jAcsGhk7l078287 | -Rp 14.000 | Pengeluaran | Rp 487.631 |\n| 20/08/2026 | Pembayaran QRIS | Toko bensin dan gas bakun G117804512 | Xq8AX1NFOUhmjl375691 | -Rp 12.500 | Pengeluaran | Rp 475.131 |\n| 20/08/2026 | Top Up E-Wallet | SHOPEEPAY 085737853822 | 17872258659550043815 | -Rp 22.000 | Pengeluaran | Rp 453.131 |\n| 21/08/2026 | Top Up E-Wallet | SHOPEEPAY 085737853822 | 17872812519230043971 | -Rp 22.000 | Pengeluaran | Rp 431.131 |\n| 21/08/2026 | Biaya Top Up E-Wallet | SHOPEEPAY 085737853822 | 17872812519230043971 | -Rp 1.000 | Pengeluaran | Rp 430.131 |\n";
function guessCategory(desc, type) {
    var d = desc.toLowerCase();
    if (type === "Pemasukan") {
        if (d.includes("gaji"))
            return "Gaji";
        return "Transfer Masuk";
    }
    if (d.includes("blusaving") || d.includes("tabungan"))
        return "Tabungan, Dana darurat";
    if (d.includes("pln") || d.includes("kos") || d.includes("listrik"))
        return "Kos";
    if (d.includes("spbu") || d.includes("bensin") || d.includes("parkir"))
        return "Bensin & Transportasi";
    if (d.includes("ioh") || d.includes("telkomsel") || d.includes("pulsa") || d.includes("internet"))
        return "Internet & Komunikasi";
    if (d.includes("barber") || d.includes("laundry") || d.includes("salon"))
        return "Personal Care";
    if (d.includes("coffee") || d.includes("shopeepay") || d.includes("gopay") || d.includes("top up e-wallet") || d.includes("tokopedia") || d.includes("transfer ke"))
        return "Hiburan, Jajan, Lifestyle";
    // Default fallback for food/groceries since most remaining QRIS is food
    return "Makan & Minuman";
}
function run() {
    return __awaiter(this, void 0, void 0, function () {
        var lines, categories, catMap, importedCount, transactionsToInsert, _i, lines_1, line, parts, dateStr, typeStr, amountStr, desc, amount, type, catName, categoryId, _a, dd, mm, yyyy, dateObj, result;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    lines = rawData.trim().split("\n").filter(function (l) { return l.startsWith("|"); });
                    return [4 /*yield*/, prisma.category.findMany()];
                case 1:
                    categories = _b.sent();
                    catMap = new Map(categories.map(function (c) { return [c.name, c.id]; }));
                    importedCount = 0;
                    transactionsToInsert = [];
                    for (_i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
                        line = lines_1[_i];
                        parts = line.split("|").map(function (s) { return s.trim(); }).filter(function (s) { return s !== ""; });
                        if (parts.length < 5)
                            continue;
                        dateStr = parts[0];
                        if (!dateStr.match(/\d{2}\/\d{2}\/\d{4}/))
                            continue; // skip headers
                        typeStr = parts[parts.length - 2];
                        amountStr = parts[parts.length - 3].replace(/[^0-9]/g, "");
                        desc = parts.slice(1, parts.length - 3).join(" - ");
                        amount = parseInt(amountStr, 10);
                        if (isNaN(amount) || amount <= 0)
                            continue;
                        type = typeStr === "Pemasukan" ? "INCOME" : "EXPENSE";
                        catName = guessCategory(desc, typeStr);
                        categoryId = catMap.get(catName);
                        if (!categoryId) {
                            console.log("Category not found for: " + catName);
                            continue;
                        }
                        _a = dateStr.split("/"), dd = _a[0], mm = _a[1], yyyy = _a[2];
                        dateObj = new Date(parseInt(yyyy), parseInt(mm) - 1, parseInt(dd), 12, 0, 0);
                        transactionsToInsert.push({
                            amount: amount,
                            type: type,
                            description: desc,
                            date: dateObj,
                            categoryId: categoryId
                        });
                        importedCount++;
                    }
                    if (!(transactionsToInsert.length > 0)) return [3 /*break*/, 3];
                    return [4 /*yield*/, prisma.transaction.createMany({
                            data: transactionsToInsert
                        })];
                case 2:
                    result = _b.sent();
                    console.log("\u2705 Berhasil mengimport ".concat(result.count, " transaksi dari CSV Blu BCA!"));
                    return [3 /*break*/, 4];
                case 3:
                    console.log("\u274C Tidak ada transaksi valid yang bisa di-import.");
                    _b.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    });
}
run()
    .catch(function (e) { return console.error(e); })
    .finally(function () { return prisma.$disconnect(); });

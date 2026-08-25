// 公開サイトの基本情報。検索結果・SNS共有・構造化データで使う。
// 予約システムの説明ではなく「宿の紹介」を書く。検索した人が読むのはこちら。

export const SITE = {
  name: "一棟貸し宿「SUGOMORI」",
  shortName: "トレイルハウス SUGOMORI",
  tagline: "北海道・大樹町の焚き火とBBQを楽しむ一棟貸しトレイルハウス",
  description:
    "北海道十勝・大樹町下大樹の一棟貸し宿「SUGOMORI」。1日1組限定で1LDKのトレイルハウスを貸切。光害のない満天の星の下、焚き火・BBQをお愉しみいただけます。",
  address: {
    region: "北海道",
    locality: "広尾郡大樹町",
    street: "下大樹",
    full: "北海道広尾郡大樹町下大樹",
    // 英語ページ用。DB の facility.address は日本語表記のみなので、
    // 海外のお客様が地図アプリに入れられる形をこちらで持つ。
    fullEn: "Shimotaiki, Taiki-cho, Hiroo-gun, Hokkaido, Japan",
  },
  phone: "080-5830-4957",
  checkIn: "15:00",
  checkOut: "10:00",
  maxGuests: 2,
} as const;

export function siteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  return fromEnv || "https://sugomori-hokkaido.jp";
}

/** 宿泊施設の構造化データ。Google に「宿」として理解させる。 */
export function lodgingJsonLd(): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: SITE.name,
    // 英語で検索されたときに宿名が結び付くようにする
    alternateName: "SUGOMORI — trail house in Taiki, Hokkaido",
    knowsLanguage: ["ja", "en"],
    description: SITE.description,
    url: siteUrl(),
    telephone: SITE.phone,
    address: {
      "@type": "PostalAddress",
      addressRegion: SITE.address.region,
      addressLocality: SITE.address.locality,
      streetAddress: SITE.address.street,
      addressCountry: "JP",
    },
    checkinTime: SITE.checkIn,
    checkoutTime: SITE.checkOut,
    petsAllowed: false,
    smokingAllowed: false,
    numberOfRooms: 1,
    amenityFeature: [
      "焚き火・BBQ",
      "無料Wi-Fi",
      "駐車場",
      "キッチン",
      "洗濯機",
      "エアコン",
    ].map((name) => ({ "@type": "LocationFeatureSpecification", name, value: true })),
  });
}

# Rota Defteri

Türkiye’deki şehirler için gün gün gezi rotası oluşturan tek sayfalık web sitesi. Şehir, gün sayısı, ilgi alanları, tarih, bütçe ve kiminle gidildiği seçilir. Site mekânları, yemekleri ve duraklar arası mesafeyi harita üzerinde gösterir.

Şehirler: İstanbul, Konya, Kapadokya, İzmir, Antalya, Trabzon, Mersin, Adana.

## Çalıştırma

`index.html` dosyasına çift tıklayın. Sunucu veya kurulum gerekmez.

İsterseniz yerel sunucuyla açın:

    python3 -m http.server 8000

Sonra http://localhost:8000 adresine gidin.

## Yapı

- `src/core.js` rota motoru
- `src/ui2.js`, `src/head2.html` arayüz ve tasarım
- `src/data/` şehirlere göre mekânlar
- `src/info.js`, `src/tips.js` tarihçe ve gezme ipuçları
- `build.sh` kaynakları tek `index.html` dosyasında birleştirir
- `test/` duman testleri (Node ve jsdom gerekir)

Kaynak dosyalarda değişiklik yaptıktan sonra `./build.sh` çalıştırın.

## Notlar

- Birçok mekânın konumu yaklaşıktır ve haritada “konum yaklaşık” diye işaretlidir.
- Çalışma saatleri, bilet ve etkinlik tarihleri gitmeden önce resmî kaynaktan doğrulanmalıdır.

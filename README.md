# Günlük Ajandam

Kişisel gelişim ve hayat yönetimi için tek dosyalık bir PWA. Harici bağımlılık yok — vanilla HTML/CSS/JS, veriler tarayıcıda (localStorage) saklanır. Ana ekrana eklenip normal bir uygulama gibi kullanılabilir.

## Kurulum

1. `index.html` dosyasını bir statik barındırma servisine yükleyin (ör. GitHub Pages).
2. Adresi Safari'de açın.
3. Paylaş → Ana Ekrana Ekle.

> iOS, yerel (`file://`) HTML dosyalarında JavaScript'i güvenlik nedeniyle kısıtlıyor — bu yüzden gerçek bir https adresinden sunulması gerekiyor.

## Modüller

| Modül | İçerik |
|---|---|
| **Ana Sayfa** | Selamlama, günün sözü, hava durumu, kişisel hedef notu, özelleştirilebilir kart dizisi (gösterme/gizleme/sıralama) |
| **Görevler** | Öncelikli görev listesi, Yapılacak/Devam Eden/Tamamlandı durumları |
| **Rutinler** | Kategorili günlük alışkanlıklar, seri (streak) takibi, ısı haritası, haftalık/aylık istatistik |
| **Takvim** | Günlük/haftalık görünüm, saatli etkinlikler, yıllık tekrar (doğum günü vb.), düzenleme |
| **Hedef Takibi** | Günlük/haftalık/aylık hedefler, ilerleme çubukları |
| **Odaklanma** | Pomodoro zamanlayıcı, çalışma/mola döngüsü, süre istatistikleri |
| **Öğrenme Takibi** | Kelime bankası + flashcard tekrarı, kitap okuma sayfa takibi |
| **Sağlık** | Su, egzersiz, uyku, kilo takibi |
| **İbadet Takibi** | 5 vakit namaz, kaza namazı sayacı (elle veya tarih aralığına göre otomatik hesap), Kur'an sayfa takibi |
| **Finans** | Bakiye, gelir/gider kaydı, aylık özet |
| **Notlar** | Metin + fotoğraflı hızlı notlar |
| **Başarılarım** | XP, seviye, rozetler |
| **Ayarlar** | Tema (açık/koyu/otomatik), vurgu rengi, kart sıralaması, veri dışa/içe aktarma, tüm verileri sıfırlama |

## Teknik notlar

- Tüm native `prompt()`/`confirm()`/`alert()` çağrıları kendi sheet tabanlı arayüzle değiştirildi — iOS'ta ana ekrana eklenmiş uygulamalarda bu native pencereler güvenilir çalışmıyor.
- Hava durumu [Open-Meteo](https://open-meteo.com) üzerinden, anahtar gerektirmeden çekiliyor (konum izni ister).
- Veri şeması `STORAGE_KEYS` altında tek yerde tanımlı; dışa aktarma/içe aktarma otomatik olarak tüm modülleri kapsar.

import React, { useState, useEffect } from 'react';
import { Text, View, Button, Image } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [bookInfo, setBookInfo] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true);

    // Requête à l'API Open Library
    const response = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${data}&format=json&jscmd=data`);
    const result = await response.json();
    const bookData = result[`ISBN:${data}`];

    if (bookData) {
      setBookInfo({
        title: bookData.title,
        authors: bookData.authors ? bookData.authors.map(author => author.name).join(', ') : 'Inconnu',
        publishers: bookData.publishers ? bookData.publishers.map(publisher => publisher.name).join(', ') : 'Inconnu',
        publishDate: bookData.publish_date || 'Date inconnue',
        coverImage: bookData.cover ? bookData.cover.large : null,
        subjects: bookData.subjects ? bookData.subjects.map(subject => subject.name).join(', ') : 'Non spécifié'
      });
    } else {
      alert('Livre non trouvé');
    }
  };

  if (hasPermission === null) {
    return <Text>Demande de permission pour la caméra</Text>;
  }
  if (hasPermission === false) {
    return <Text>Aucune accès à la caméra</Text>;
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={{ height: 400, width: 400 }}
      />

      {scanned && <Button title={'Scanner à nouveau'} onPress={() => setScanned(false)} />}

      {bookInfo && (
        <View>
          <Text>Titre: {bookInfo.title}</Text>
          <Text>Auteur: {bookInfo.authors}</Text>
          <Text>Éditeur: {bookInfo.publishers}</Text>
          <Text>Date de publication: {bookInfo.publishDate}</Text>
          {bookInfo.coverImage && <Image source={{ uri: bookInfo.coverImage }} style={{ width: 100, height: 150 }} />}
          <Text>Sujets: {bookInfo.subjects}</Text>
        </View>
      )}
    </View>
  );
}

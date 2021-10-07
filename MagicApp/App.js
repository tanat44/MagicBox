import React from 'react';
import { View, Text, Image, ScrollView, TextInput, Button } from 'react-native';

const App = () => {
  return (
    <ScrollView>
      <Text>Some text</Text>
      <View>
        <Text>Some more text</Text>
        <Image
          source={{
            uri: 'https://reactnative.dev/docs/assets/p_cat2.png',
          }}
          style={{ width: 200, height: 200 }}
        />
      </View>
      <TextInput
        style={{
          height: 40,
          borderColor: 'gray',
          borderWidth: 1
        }}
        defaultValue="You can type in me"
      />
      <Button
        onPress={()=>{
            alert("dddd")
            console.log("test print")
        }}
        title="Connect"
        color="#841584"
        accessibilityLabel="Learn more about this purple button"
        />
    </ScrollView>
    
  );
}

export default App;
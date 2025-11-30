
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

// Register fonts
Font.register({
  family: 'Arial',
  fonts: [
    { src: '/fonts/arial.ttf' },
    { src: '/fonts/arialbd.ttf', fontWeight: 'bold' },
    { src: '/fonts/ariali.ttf', fontStyle: 'italic' },
    { src: '/fonts/arialbi.ttf', fontWeight: 'bold', fontStyle: 'italic' },
  ],
});
Font.register({
  family: 'Calibri',
  fonts: [
    { src: '/fonts/calibri.ttf' },
    { src: '/fonts/calibrib.ttf', fontWeight: 'bold' },
    { src: '/fonts/calibrii.ttf', fontStyle: 'italic' },
    { src: '/fonts/calibriz.ttf', fontWeight: 'bold', fontStyle: 'italic' },
  ],
});
Font.register({
  family: 'Georgia',
  fonts: [
    { src: '/fonts/georgia.ttf' },
    { src: '/fonts/georgiab.ttf', fontWeight: 'bold' },
    { src: '/fonts/georgiai.ttf', fontStyle: 'italic' },
    { src: '/fonts/georgiaz.ttf', fontWeight: 'bold', fontStyle: 'italic' },
  ],
});
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: '/fonts/helvetica.ttf' },
    { src: '/fonts/helveticab.ttf', fontWeight: 'bold' },
    { src: '/fonts/helveticai.ttf', fontStyle: 'italic' },
    { src: '/fonts/helveticab.ttf', fontWeight: 'bold', fontStyle: 'italic' },
  ],
});
Font.register({
  family: 'Lato',
  fonts: [
    { src: '/fonts/Lato-Regular.ttf' },
    { src: '/fonts/Lato-Bold.ttf', fontWeight: 'bold' },
    { src: '/fonts/Lato-Italic.ttf', fontStyle: 'italic' },
    { src: '/fonts/Lato-BoldItalic.ttf', fontWeight: 'bold', fontStyle: 'italic' },
  ],
});
Font.register({
  family: 'Open Sans',
  fonts: [
    { src: '/fonts/OpenSans-Regular.ttf' },
    { src: '/fonts/OpenSans-Bold.ttf', fontWeight: 'bold' },
    { src: '/fonts/OpenSans-Italic.ttf', fontStyle: 'italic' },
    { src: '/fonts/OpenSans-BoldItalic.ttf', fontWeight: 'bold', fontStyle: 'italic' },
  ],
});
Font.register({
  family: 'Poppins',
  fonts: [
    { src: '/fonts/Poppins-Regular.otf' },
    { src: '/fonts/Poppins-Bold.otf', fontWeight: 'bold' },
    { src: '/fonts/Poppins-Italic.otf', fontStyle: 'italic' },
    { src: '/fonts/Poppins-BoldItalic.otf', fontWeight: 'bold', fontStyle: 'italic' },
  ],
});
Font.register({
  family: 'Roboto',
  fonts: [
    { src: '/fonts/Roboto-Regular.ttf' },
    { src: '/fonts/Roboto-Bold.ttf', fontWeight: 'bold' },
    { src: '/fonts/Roboto-Italic.ttf', fontStyle: 'italic' },
    { src: '/fonts/Roboto-BoldItalic.ttf', fontWeight: 'bold', fontStyle: 'italic' },
  ],
});
Font.register({
  family: 'Source Sans Pro',
  fonts: [
    { src: '/fonts/SourceSansPro-Regular.otf' },
    { src: '/fonts/SourceSansPro-Bold.otf', fontWeight: 'bold' },
    { src: '/fonts/SourceSansPro-It.otf', fontStyle: 'italic' },
    { src: '/fonts/SourceSansPro-BoldIt.otf', fontWeight: 'bold', fontStyle: 'italic' },
  ],
});
Font.register({
  family: 'Source Code Pro',
  fonts: [
    { src: '/fonts/SourceCodePro-Regular.otf' },
    { src: '/fonts/SourceCodePro-Bold.otf', fontWeight: 'bold' },
    { src: '/fonts/SourceCodePro-It.otf', fontStyle: 'italic' },
    { src: '/fonts/SourceCodePro-BoldIt.otf', fontWeight: 'bold', fontStyle: 'italic' },
  ],
});
Font.register({
  family: 'Times New Roman',
  fonts: [
    { src: '/fonts/times.ttf' },
    { src: '/fonts/timesbd.ttf', fontWeight: 'bold' },
    { src: '/fonts/timesi.ttf', fontStyle: 'italic' },
    { src: '/fonts/timesbi.ttf', fontWeight: 'bold', fontStyle: 'italic' },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 30,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  jobTitle: {
    fontSize: 16,
    marginBottom: 10,
  },
  personalInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  personalInfoItem: {
    width: '50%',
    marginBottom: 5,
  },
  section: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingBottom: 2,
  },
  entry: {
    marginBottom: 10,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  entryTitle: {
    fontWeight: 'bold',
  },
  entryDate: {
    fontStyle: 'italic',
  },
  entryDescription: {
    marginTop: 5,
  },
  skills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skill: {
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    padding: 5,
    margin: 2,
  },
});

const parseHtml = (html: string) => {
  const listItems = html.match(/<li>(.*?)<\/li>/g)?.map(item => item.replace(/<\/?li>/g, ''));
  return listItems || [html.replace(/<\/?p>/g, '')];
};

export const PdfDocument = ({ cv, style }: any) => (
  <Document>
    <Page size="A4" style={[styles.page, { fontFamily: style.fontFamily, color: style.textColor }]}>
      <View>
        <Text style={[styles.name, { color: style.primaryColor }]}>{cv.personalInfo.name}</Text>
        <Text style={styles.jobTitle}>{cv.personalInfo.jobTitle}</Text>
        <View style={styles.personalInfo}>
          {cv.personalInfo.details.map((detail: any, index: number) => (
            <Text key={index} style={styles.personalInfoItem}>{detail.label}: {detail.value}</Text>
          ))}
        </View>
      </View>

      {cv.sections.map((section: any, index: number) => (
        <View key={index} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: style.primaryColor }]}>{section.title}</Text>
          {section.type === 'workExperience' && section.entries.map((entry: any, i: number) => (
            <View key={i} style={styles.entry}>
              <View style={styles.entryHeader}>
                <Text style={styles.entryTitle}>{entry.title}</Text>
                <Text style={styles.entryDate}>{entry.date}</Text>
              </View>
              <Text>{entry.company}</Text>
              {parseHtml(entry.description).map((item, j) => (
                <Text key={j}>• {item}</Text>
              ))}
            </View>
          ))}
          {section.type === 'education' && section.entries.map((entry: any, i: number) => (
            <View key={i} style={styles.entry}>
              <View style={styles.entryHeader}>
                <Text style={styles.entryTitle}>{entry.degree}</Text>
                <Text style={styles.entryDate}>{entry.date}</Text>
              </View>
              <Text>{entry.school}</Text>
              {parseHtml(entry.description).map((item, j) => (
                <Text key={j}>• {item}</Text>
              ))}
            </View>
          ))}
          {section.type === 'skills' && (
            <View style={styles.skills}>
              {section.entries.map((entry: any, i: number) => (
                <Text key={i} style={styles.skill}>{entry.skill}</Text>
              ))}
            </View>
          )}
          {section.type === 'projects' && section.entries.map((entry: any, i: number) => (
            <View key={i} style={styles.entry}>
              <View style={styles.entryHeader}>
                <Text style={styles.entryTitle}>{entry.title}</Text>
              </View>
              {parseHtml(entry.description).map((item, j) => (
                <Text key={j}>• {item}</Text>
              ))}
            </View>
          ))}
          {section.type === 'custom' && section.entries.map((entry: any, i: number) => (
            <View key={i} style={styles.entry}>
              <Text>{entry.text}</Text>
            </View>
          ))}
        </View>
      ))}
    </Page>
  </Document>
);

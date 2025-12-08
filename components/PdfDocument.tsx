
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

import { Parser } from 'html-to-react';
import { processingInstructions } from './pdf/html-to-pdf';

const htmlToReactParser = new Parser();

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
              {htmlToReactParser.parseWithInstructions(entry.description, () => true, processingInstructions)}
            </View>
          ))}
          {section.type === 'education' && section.entries.map((entry: any, i: number) => (
            <View key={i} style={styles.entry}>
              <View style={styles.entryHeader}>
                <Text style={styles.entryTitle}>{entry.degree}</Text>
                <Text style={styles.entryDate}>{entry.date}</Text>
              </View>
              <Text>{entry.school}</Text>
              {htmlToReactParser.parseWithInstructions(entry.description, () => true, processingInstructions)}
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
              {htmlToReactParser.parseWithInstructions(entry.description, () => true, processingInstructions)}
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

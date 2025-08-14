import { Component } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [NavbarComponent, CommonModule],
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.css']
})
export class FaqComponent {
  faqs = [
    {
      question: '¿Qué es HydroLink?',
      answer: 'HydroLink es una empresa especializada en sistemas de purificación de agua, ofreciendo soluciones completas para el hogar, oficinas e industrias. Nos dedicamos a proporcionar agua limpia y segura a través de tecnología avanzada y productos de alta calidad.',
      isOpen: false
    },
    {
      question: '¿Qué tipos de productos ofrecemos?',
      answer: 'Ofrecemos una amplia gama de productos incluyendo: filtros de agua domésticos, sistemas de ósmosis inversa, purificadores UV, sistemas de filtración industrial, equipos de análisis de calidad del agua, y accesorios para mantenimiento.',
      isOpen: false
    },
    {
      question: '¿Cómo sé qué sistema de purificación necesito?',
      answer: 'Nuestros expertos pueden ayudarte a determinar el sistema ideal según tus necesidades. Consideramos factores como la calidad del agua de tu zona, el uso previsto, el presupuesto disponible y los contaminantes específicos que deseas eliminar. Puedes contactarnos para una consulta personalizada.',
      isOpen: false
    },
    {
      question: '¿Ofrecen servicio de instalación?',
      answer: 'Sí, contamos con un equipo técnico especializado que se encarga de la instalación profesional de todos nuestros sistemas. También ofrecemos capacitación sobre el uso y mantenimiento básico de los equipos.',
      isOpen: false
    },
    {
      question: '¿Cuál es la garantía de los productos?',
      answer: 'Todos nuestros productos cuentan con garantía del fabricante que varía según el tipo de equipo. Los filtros domésticos tienen garantía de 1 año, los sistemas de ósmosis inversa de 2 años, y los equipos industriales de 3 años. Además, ofrecemos garantía extendida opcional.',
      isOpen: false
    },
    {
      question: '¿Con qué frecuencia debo cambiar los filtros?',
      answer: 'La frecuencia de cambio depende del tipo de filtro y las condiciones de uso. En general: filtros de sedimento cada 3-6 meses, filtros de carbón cada 6-12 meses, y membranas de ósmosis inversa cada 2-3 años. Te proporcionamos un calendario de mantenimiento personalizado.',
      isOpen: false
    },
    {
      question: '¿Realizan análisis de calidad del agua?',
      answer: 'Sí, ofrecemos servicios de análisis de calidad del agua para identificar contaminantes específicos y recomendar el sistema de purificación más adecuado. Utilizamos equipos de última generación para garantizar resultados precisos.',
      isOpen: false
    },
    {
      question: '¿Manejan proyectos industriales?',
      answer: 'Absolutamente. Tenemos experiencia en el diseño e implementación de sistemas de purificación para industrias alimentaria, farmacéutica, química y manufacturera. Cada proyecto se personaliza según los requisitos específicos del cliente.',
      isOpen: false
    },
    {
      question: '¿Cómo puedo obtener una cotización?',
      answer: 'Puedes solicitar una cotización a través de nuestra página de cotizaciones en línea, por teléfono, o visitando nuestras oficinas. Necesitaremos información sobre tus necesidades específicas para proporcionarte una cotización precisa y detallada.',
      isOpen: false
    },
    {
      question: '¿Ofrecen capacitación y soporte técnico?',
      answer: 'Sí, proporcionamos capacitación completa sobre el uso y mantenimiento de nuestros equipos. También tenemos un equipo de soporte técnico disponible para resolver cualquier duda o problema que puedas tener con tu sistema de purificación.',
      isOpen: false
    },
    {
      question: '¿Cuáles son sus horarios de atención?',
      answer: 'Nuestros horarios de atención son de Lunes a Viernes de 9:00 AM a 6:00 PM CST. Para emergencias técnicas, contamos con servicio de atención 24/7 a través de nuestro número de emergencia.',
      isOpen: false
    },
    {
      question: '¿Tienen planes de mantenimiento preventivo?',
      answer: 'Sí, ofrecemos planes de mantenimiento preventivo que incluyen revisiones periódicas, cambio de filtros, calibración de equipos y análisis de rendimiento. Estos planes ayudan a mantener la eficiencia de tu sistema y prolongar su vida útil.',
      isOpen: false
    }
  ];

  toggleFaq(index: number) {
    this.faqs[index].isOpen = !this.faqs[index].isOpen;
  }
}

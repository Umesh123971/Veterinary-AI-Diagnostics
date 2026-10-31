from rest_framework.decorators import api_view,permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from diagnostics.models import Patient
from users.models import CustomUser

@api_view(['GET'])
@permission_classes([AllowAny])
def analytics_overview(request):
    patients=list(Patient.objects.all())
    analysed=[p for p in patients if p.fusion_details.get('mode')]
    return Response(dict(totalCases=len(patients),completedDiagnoses=sum(p.status=='Diagnosis Complete' for p in analysed),
                         pendingDoctorReviews=sum(p.status=='Awaiting Verification' for p in analysed),
                         awaitingLabAnalysis=sum(not p.fusion_details.get('mode') for p in patients),
                         totalUsers=CustomUser.objects.count(),currentAnalyses=len(analysed),
                         cbcOnly=sum(p.fusion_details.get('mode')=='cbc_only' for p in analysed),
                         systemAccuracy=None,modelPerformance=None,weeklyTrends=[],diseaseDistribution=[],
                         note='No validated accuracy is claimed for the current combined screening workflow.'))
